import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navBar';
import api from '../api';

function AdminStations() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [showMasterForm, setShowMasterForm] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [masterForm, setMasterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  // Add Station states
  const [showAddStation, setShowAddStation] = useState(false);
  const [addStationStep, setAddStationStep] = useState('station'); // 'station' or 'master'
  const [newStationData, setNewStationData] = useState({
    name: '',
    isOnline: 'Y',
    location: '',
    division: '',
    contactNum: '',
    status: 'ACTIVE'
  });
  const [newMasterData, setNewMasterData] = useState({
    name: '',
    email: '',
    phoneNum: '',
    password: ''
  });
  const [createdStationId, setCreatedStationId] = useState('');
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [showNewMasterPassword, setShowNewMasterPassword] = useState(false);

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

    if (fieldName === 'password' && value && value.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  };

  const togglePasswordVisibility = (stationId) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [stationId]: !prev[stationId]
    }));
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

  // Add Station Functions
  const handleCreateStation = async () => {
    setSubmitMessage({ type: '', text: '' });
    
    // Validate station data
    const errors = {};
    if (!newStationData.name.trim()) {
      errors.name = 'Station name is required';
    }
    if (newStationData.contactNum && !/^\d{10,14}$/.test(newStationData.contactNum)) {
      errors.contactNum = 'Contact number must be 10-14 digits';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await api.post("/admin/stations", newStationData);
      
      if (response.data.status === 'success') {
        setCreatedStationId(response.data.stationId);
        setSubmitMessage({ 
          type: 'success', 
          text: response.data.message 
        });
        setAddStationStep('master');
        setValidationErrors({});
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: response.data.message || 'Failed to create station' 
        });
      }
    } catch (error) {
      console.error('Error creating station:', error);
      let errorMessage = 'Failed to create station';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleCreateStationMaster = async () => {
    setSubmitMessage({ type: '', text: '' });
    
    // Validate master data
    const errors = {};
    if (!newMasterData.name.trim()) errors.masterName = 'Station master name is required';
    if (!newMasterData.email.trim()) errors.masterEmail = 'Email is required';
    if (!newMasterData.phoneNum.trim()) errors.masterPhone = 'Phone number is required';
    if (!newMasterData.password.trim()) errors.masterPassword = 'Password is required';

    if (newMasterData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMasterData.email)) {
      errors.masterEmail = 'Invalid email format';
    }

    if (newMasterData.phoneNum && !/^\d{10,14}$/.test(newMasterData.phoneNum)) {
      errors.masterPhone = 'Phone number must be 10-14 digits';
    }
    
    if (newMasterData.password && newMasterData.password.length < 6) {
      errors.masterPassword = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await api.post(`/admin/stations/${createdStationId}/station-master`, newMasterData);
      
      if (response.data.status === 'success') {
        setSubmitMessage({ 
          type: 'success', 
          text: 'Station and station master created successfully!' 
        });
        
        // Reset all form data and close the form
        setTimeout(() => {
          setShowAddStation(false);
          setAddStationStep('station');
          setNewStationData({
            name: '',
            isOnline: 'Y',
            location: '',
            division: '',
            contactNum: '',
            status: 'ACTIVE'
          });
          setNewMasterData({
            name: '',
            email: '',
            phoneNum: '',
            password: ''
          });
          setCreatedStationId('');
          setSubmitMessage({ type: '', text: '' });
          setValidationErrors({});
          fetchStations(); // Refresh the station list
        }, 2000);
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: response.data.message || 'Failed to create station master' 
        });
      }
    } catch (error) {
      console.error('Error creating station master:', error);
      let errorMessage = 'Failed to create station master';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitMessage({ type: 'error', text: errorMessage });
    }
  };

  const resetAddStationForm = () => {
    setShowAddStation(false);
    setAddStationStep('station');
    setNewStationData({
      name: '',
      isOnline: 'Y',
      location: '',
      division: '',
      contactNum: '',
      status: 'ACTIVE'
    });
    setNewMasterData({
      name: '',
      email: '',
      phoneNum: '',
      password: ''
    });
    setCreatedStationId('');
    setSubmitMessage({ type: '', text: '' });
    setValidationErrors({});
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

    // Special handling for password field
    if (fieldName === 'password') {
      const isPasswordVisible = passwordVisibility[station.stationId];
      
      return (
        <div className="mb-2" key={fieldName}>
          <strong>{displayName}:</strong>
          <div className="d-flex align-items-center mt-1">
            {isEditing ? (
              <div className="flex-grow-1">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      updateField(station.stationId, fieldName, e.target.value);
                    } else {
                      setEditingField(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      updateField(station.stationId, fieldName, e.target.value);
                    } else if (e.key === 'Escape') {
                      setEditingField(null);
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <>
                <span className="flex-grow-1">
                  {isPasswordVisible ? fieldValue : '••••••••'}
                </span>
                <button 
                  className="btn btn-outline-secondary btn-sm ms-2"
                  onClick={() => togglePasswordVisibility(station.stationId)}
                  type="button"
                >
                  {isPasswordVisible ? '👁️‍🗨️' : '👁️'}
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm ms-1"
                  onClick={() => setEditingField(fieldId)}
                  type="button"
                >
                  ✏️
                </button>
              </>
            )}
          </div>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Station Management</h2>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-success"
              onClick={() => setShowAddStation(true)}
            >
              + Add Station
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/admin/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
        
        {/* Add Station Form */}
        {showAddStation && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                {addStationStep === 'station' ? 'Add New Station' : 'Assign Station Master'}
              </h5>
            </div>
            <div className="card-body">
              {/* Submit Message */}
              {submitMessage.text && (
                <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                  {submitMessage.text}
                </div>
              )}

              {addStationStep === 'station' ? (
                /* Station Form */
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Station Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStationData.name}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter station name"
                      />
                      {validationErrors.name && <div className="text-danger small mt-1">{validationErrors.name}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Online Status</label>
                      <select
                        className="form-select"
                        value={newStationData.isOnline}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, isOnline: e.target.value }))}
                      >
                        <option value="Y">Online</option>
                        <option value="N">Offline</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStationData.location}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Division</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStationData.division}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, division: e.target.value }))}
                        placeholder="Enter division"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStationData.contactNum}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, contactNum: e.target.value }))}
                        placeholder="Enter contact number (10-14 digits)"
                      />
                      {validationErrors.contactNum && <div className="text-danger small mt-1">{validationErrors.contactNum}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={newStationData.status}
                        onChange={(e) => setNewStationData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={handleCreateStation}
                    >
                      Create Station
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={resetAddStationForm}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Station Master Form */
                <div>
                  <div className="alert alert-info mb-3">
                    Station created successfully! Station ID: <strong>{createdStationId}</strong>
                    <br />Now assign a station master to complete the setup.
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Master Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newMasterData.name}
                        onChange={(e) => setNewMasterData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter station master name"
                      />
                      {validationErrors.masterName && <div className="text-danger small mt-1">{validationErrors.masterName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newMasterData.email}
                        onChange={(e) => setNewMasterData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                      {validationErrors.masterEmail && <div className="text-danger small mt-1">{validationErrors.masterEmail}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newMasterData.phoneNum}
                        onChange={(e) => setNewMasterData(prev => ({ ...prev, phoneNum: e.target.value }))}
                        placeholder="Enter phone number (10-14 digits)"
                      />
                      {validationErrors.masterPhone && <div className="text-danger small mt-1">{validationErrors.masterPhone}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <div className="input-group">
                        <input
                          type={showNewMasterPassword ? "text" : "password"}
                          className="form-control"
                          value={newMasterData.password}
                          onChange={(e) => setNewMasterData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password (min 6 characters)"
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowNewMasterPassword(!showNewMasterPassword)}
                        >
                          {showNewMasterPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                      </div>
                      {validationErrors.masterPassword && <div className="text-danger small mt-1">{validationErrors.masterPassword}</div>}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success"
                      onClick={handleCreateStationMaster}
                    >
                      Create Station Master
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={resetAddStationForm}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
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
                        {renderEditableField(station, 'password', 'Password')}
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
