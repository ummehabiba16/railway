import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminStations() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [showMasterForm, setShowMasterForm] = useState(null);
  const [masterForm, setMasterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchStations();
  }, [navigate]);

  const fetchStations = async () => {
    try {
      const response = await api.get('/admin/stations');
      setStations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setError('Failed to load stations data');
      setLoading(false);
    }
  };

  const validateField = (fieldName, value) => {
    const requiredFields = ['stationName', 'location', 'division', 'contactNum'];
    
    if (requiredFields.includes(fieldName) && (!value || value.trim() === '')) {
      return `${fieldName} is required`;
    }

    if (fieldName === 'contactNum' && value && !/^\d{10,14}$/.test(value)) {
      return 'Contact number must be 10-14 digits';
    }

    if (fieldName === 'masterEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }

    if (fieldName === 'masterPhone' && value && !/^\d{10,14}$/.test(value)) {
      return 'Phone number must be 10-14 digits';
    }

    return null;
  };

  const updateField = async (stationId, fieldName, value) => {
    const validationError = validateField(fieldName, value);
    if (validationError) {
      setValidationErrors(prev => ({
        ...prev,
        [`${stationId}_${fieldName}`]: validationError
      }));
      return;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${stationId}_${fieldName}`];
      return newErrors;
    });

    try {
      await api.put(`/admin/stations/${stationId}?fieldName=${fieldName}&value=${encodeURIComponent(value)}`);
      
      setStations(prevStations =>
        prevStations.map(station =>
          station.stationId === stationId
            ? { ...station, [fieldName]: value }
            : station
        )
      );
      setEditingField(null);
    } catch (error) {
      console.error('Error updating field:', error);
      setError('Failed to update field');
    }
  };

  const handleMasterFormSubmit = async (stationId) => {
    const errors = {};
    if (!masterForm.name.trim()) errors.name = 'Name is required';
    if (!masterForm.email.trim()) errors.email = 'Email is required';
    if (!masterForm.phone.trim()) errors.phone = 'Phone is required';
    if (!masterForm.password.trim()) errors.password = 'Password is required';

    if (masterForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(masterForm.email)) {
      errors.email = 'Invalid email format';
    }

    if (masterForm.phone && !/^\d{10,14}$/.test(masterForm.phone)) {
      errors.phone = 'Phone number must be 10-14 digits';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', masterForm.name);
      formData.append('email', masterForm.email);
      formData.append('phone', masterForm.phone);
      formData.append('password', masterForm.password);

      await api.post(`/admin/stations/${stationId}/master`, formData);
      
      setShowMasterForm(null);
      setMasterForm({ name: '', email: '', phone: '', password: '' });
      setValidationErrors({});
      fetchStations();
    } catch (error) {
      console.error('Error creating station master:', error);
      setError('Failed to create station master');
    }
  };

  const renderEditableField = (station, fieldName, displayName) => {
    const fieldValue = station[fieldName] || '';
    const fieldId = `${station.stationId}_${fieldName}`;
    const isEditing = editingField === fieldId;
    const errorKey = `${station.stationId}_${fieldName}`;
    const hasError = validationErrors[errorKey];

    if (fieldName === 'isOnline' || fieldName === 'status') {
      const options = fieldName === 'isOnline' 
        ? [{ value: 'Y', label: 'Online' }, { value: 'N', label: 'Offline' }]
        : [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }];

      return (
        <div className="mb-2" key={fieldName}>
          <strong>{displayName}:</strong>
          {isEditing ? (
            <select
              className="form-select mt-1"
              value={fieldValue}
              onChange={(e) => updateField(station.stationId, fieldName, e.target.value)}
              onBlur={() => setEditingField(null)}
              autoFocus
            >
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <span 
              className="text-primary cursor-pointer ms-2"
              onClick={() => setEditingField(fieldId)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {options.find(opt => opt.value === fieldValue)?.label || fieldValue}
            </span>
          )}
          {hasError && <div className="text-danger small">{validationErrors[errorKey]}</div>}
        </div>
      );
    }

    return (
      <div className="mb-2" key={fieldName}>
        <strong>{displayName}:</strong>
        {isEditing ? (
          <input
            type="text"
            className="form-control mt-1"
            value={fieldValue}
            onChange={(e) => {
              setStations(prevStations =>
                prevStations.map(s =>
                  s.stationId === station.stationId
                    ? { ...s, [fieldName]: e.target.value }
                    : s
                )
              );
            }}
            onBlur={(e) => updateField(station.stationId, fieldName, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateField(station.stationId, fieldName, e.target.value);
              } else if (e.key === 'Escape') {
                setEditingField(null);
                fetchStations();
              }
            }}
            autoFocus
          />
        ) : (
          <span 
            className="text-primary cursor-pointer ms-2"
            onClick={() => setEditingField(fieldId)}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {fieldValue || 'Click to edit'}
          </span>
        )}
        {hasError && <div className="text-danger small">{validationErrors[errorKey]}</div>}
      </div>
    );
  };

  const renderMasterForm = (stationId) => (
    <div className="border p-3 mt-3 rounded">
      <h6>Create Station Master</h6>
      <div className="mb-2">
        <label className="form-label">Name:</label>
        <input
          type="text"
          className="form-control"
          value={masterForm.name}
          onChange={(e) => setMasterForm(prev => ({ ...prev, name: e.target.value }))}
        />
        {validationErrors.name && <div className="text-danger small">{validationErrors.name}</div>}
      </div>
      <div className="mb-2">
        <label className="form-label">Email:</label>
        <input
          type="email"
          className="form-control"
          value={masterForm.email}
          onChange={(e) => setMasterForm(prev => ({ ...prev, email: e.target.value }))}
        />
        {validationErrors.email && <div className="text-danger small">{validationErrors.email}</div>}
      </div>
      <div className="mb-2">
        <label className="form-label">Phone:</label>
        <input
          type="text"
          className="form-control"
          value={masterForm.phone}
          onChange={(e) => setMasterForm(prev => ({ ...prev, phone: e.target.value }))}
        />
        {validationErrors.phone && <div className="text-danger small">{validationErrors.phone}</div>}
      </div>
      <div className="mb-2">
        <label className="form-label">Password:</label>
        <input
          type="password"
          className="form-control"
          value={masterForm.password}
          onChange={(e) => setMasterForm(prev => ({ ...prev, password: e.target.value }))}
        />
        {validationErrors.password && <div className="text-danger small">{validationErrors.password}</div>}
      </div>
      <div className="d-flex gap-2">
        <button 
          className="btn btn-success btn-sm"
          onClick={() => handleMasterFormSubmit(stationId)}
        >
          Create Master
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setShowMasterForm(null);
            setMasterForm({ name: '', email: '', phone: '', password: '' });
            setValidationErrors({});
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading stations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">Station Management</h2>
        
        {stations.length === 0 ? (
          <div className="alert alert-info">No stations found.</div>
        ) : (
          <div className="row">
            {stations.map((station) => (
              <div key={station.stationId} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Station: {station.stationId}</h5>
                  </div>
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">Station Information</h6>
                    {renderEditableField(station, 'stationName', 'Station Name')}
                    {renderEditableField(station, 'isOnline', 'Online Status')}
                    {renderEditableField(station, 'location', 'Location')}
                    {renderEditableField(station, 'division', 'Division')}
                    {renderEditableField(station, 'contactNum', 'Contact Number')}
                    {renderEditableField(station, 'status', 'Status')}

                    <hr />
                    <h6 className="card-subtitle mb-3 text-muted">Station Master Information</h6>
                    {station.masterName ? (
                      <div>
                        {renderEditableField(station, 'masterName', 'Master Name')}
                        {renderEditableField(station, 'masterEmail', 'Master Email')}
                        {renderEditableField(station, 'masterPhone', 'Master Phone')}
                        <div className="mb-2">
                          <strong>Password:</strong>
                          <span className="ms-2">••••••••</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted">No station master assigned</p>
                        {showMasterForm === station.stationId ? (
                          renderMasterForm(station.stationId)
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowMasterForm(station.stationId)}
                          >
                            Assign Station Master
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStations;
