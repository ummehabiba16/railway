import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';

const AdminTrains = () => {
  const navigate = useNavigate();
  
  // State for trains list
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing
  const [editingTrain, setEditingTrain] = useState(null);
  const [editFormData, setEditFormData] = useState({
    trainNum: '',
    trainName: '',
    fromStationId: '',
    toStationId: '',
    offDay: ''
  });
  
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrains, setFilteredTrains] = useState([]);
  
  // State for stations (dropdowns)
  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

  // Fetch all trains
  const fetchTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/trains');
      const data = response.data;
      
      if (data.success) {
        setTrains(data.trains);
      } else {
        setError(data.message || 'Failed to fetch trains');
      }
    } catch (error) {
      console.error('Error fetching trains:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations for dropdowns
  const fetchStations = async () => {
    try {
      setStationsLoading(true);
      
      const [fromResponse, toResponse] = await Promise.all([
        api.get("/admin/trains/stations/from"),
        api.get("/admin/trains/stations/to")
      ]);

      const fromData = fromResponse.data;
      const toData = toResponse.data;
      
      if (fromData.success) {
        setFromStations(fromData.stations);
      }
      if (toData.success) {
        setToStations(toData.stations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setStationsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  // Update filtered trains when trains or search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTrains(trains);
    } else {
      const filtered = trains.filter(train => 
        train.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.trainNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.trainName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrains(filtered);
    }
  }, [trains, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle edit button click
  const handleEdit = (train) => {
    setEditingTrain(train.trainId);
    setEditFormData({
      trainNum: train.trainNum,
      trainName: train.trainName,
      fromStationId: train.fromId,
      toStationId: train.toId,
      offDay: train.offDay || ''
    });
  };

  // Toggle expanded row
  const toggleExpandedRow = (trainId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(trainId)) {
      newExpandedRows.delete(trainId);
    } else {
      newExpandedRows.add(trainId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save edit
  const handleSaveEdit = async (trainId) => {
    try {
      const response = await api.put(`/admin/trains/${trainId}`, editFormData);
      const data = response.data;
      
      if (data.success) {
        setEditingTrain(null);
        fetchTrains(); // Refresh the list
        alert('Train updated successfully!');
      } else {
        alert(data.message || 'Failed to update train');
      }
    } catch (error) {
      console.error('Error updating train:', error);
      alert('Failed to connect to server');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTrain(null);
    setEditFormData({
      trainNum: '',
      trainName: '',
      fromStationId: '',
      toStationId: '',
      offDay: ''
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading trains...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-train me-2"></i>
                Train Management
              </h2>
              <div>
                <button 
                  className="btn btn-success me-2"
                  onClick={() => navigate('/admin/trains/add')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Train
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body py-3">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search trains by ID, Number, or Name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setSearchTerm('')}
                          title="Clear search"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <small className="text-muted">
                      {searchTerm ? `${filteredTrains.length} of ${trains.length} trains found` : `${trains.length} total trains`}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger d-flex justify-content-between align-items-center">
                {error}
                <button className="btn btn-outline-danger btn-sm" onClick={fetchTrains}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trains Table */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                  {searchTerm ? `Search Results (${filteredTrains.length})` : `All Trains (${trains.length})`}
                </h6>
              </div>
              <div className="card-body">
                {filteredTrains.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-train fa-3x text-muted mb-3"></i>
                    {searchTerm ? (
                      <div>
                        <p className="text-muted">No trains found matching "{searchTerm}"</p>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted">No trains found</p>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Train Number</th>
                          <th>Train Name</th>
                          <th>From Station</th>
                          <th>To Station</th>
                          <th>Off Day</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrains.map((train) => (
                          <React.Fragment key={train.trainId}>
                            <tr>
                            {editingTrain === train.trainId ? (
                              // Edit mode
                              <>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="trainNum"
                                    value={editFormData.trainNum}
                                    onChange={handleEditInputChange}
                                    maxLength="6"
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="trainName"
                                    value={editFormData.trainName}
                                    onChange={handleEditInputChange}
                                    maxLength="100"
                                    required
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    name="fromStationId"
                                    value={editFormData.fromStationId}
                                    onChange={handleEditInputChange}
                                    required
                                  >
                                    <option value="">Select From Station</option>
                                    {fromStations.map((station) => (
                                      <option key={station.stationId} value={station.stationId}>
                                        {station.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    name="toStationId"
                                    value={editFormData.toStationId}
                                    onChange={handleEditInputChange}
                                    required
                                  >
                                    <option value="">Select To Station</option>
                                    {toStations.map((station) => (
                                      <option key={station.stationId} value={station.stationId}>
                                        {station.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    name="offDay"
                                    value={editFormData.offDay}
                                    onChange={handleEditInputChange}
                                  >
                                    <option value="">Select Off Day</option>
                                    <option value="SUNDAY">Sunday</option>
                                    <option value="MONDAY">Monday</option>
                                    <option value="TUESDAY">Tuesday</option>
                                    <option value="WEDNESDAY">Wednesday</option>
                                    <option value="THURSDAY">Thursday</option>
                                    <option value="FRIDAY">Friday</option>
                                    <option value="SATURDAY">Saturday</option>
                                  </select>
                                </td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleSaveEdit(train.trainId)}
                                      title="Save Changes"
                                    >
                                      <i className="fas fa-save me-1"></i>
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={handleCancelEdit}
                                      title="Cancel"
                                    >
                                      <i className="fas fa-times me-1"></i>
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // View mode
                              <>
                                <td>{train.trainNum}</td>
                                <td>{train.trainName}</td>
                                <td>{train.fromStation}</td>
                                <td>{train.toStation}</td>
                                <td>{train.offDay || 'None'}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleEdit(train)}
                                      title="Quick Edit"
                                    >
                                      <i className="fas fa-edit me-1"></i>
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-info btn-sm"
                                      onClick={() => toggleExpandedRow(train.trainId)}
                                      title={expandedRows.has(train.trainId) ? "Hide Details" : "View More Details & Actions"}
                                    >
                                      <i className={`fas fa-chevron-${expandedRows.has(train.trainId) ? 'up' : 'down'} me-1`}></i>
                                      {expandedRows.has(train.trainId) ? 'Less' : 'More'}
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                          {/* Expanded Row */}
                          {expandedRows.has(train.trainId) && (
                            <tr>
                              <td colSpan="6" className="p-0">
                                <div className="card m-3 border-primary">
                                  <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">
                                      <i className="fas fa-info-circle me-2"></i>
                                      Train Details - {train.trainName} ({train.trainNum})
                                    </h6>
                                  </div>
                                  <div className="card-body">
                                    <div className="row">
                                      <div className="col-md-8">
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="fw-bold text-muted">Train Information</label>
                                              <div className="border rounded p-2 bg-light">
                                                <p className="mb-1"><strong>Train ID:</strong> <span className="text-primary">{train.trainId}</span></p>
                                                <p className="mb-1"><strong>Train Number:</strong> {train.trainNum}</p>
                                                <p className="mb-0"><strong>Train Name:</strong> {train.trainName}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <div className="mb-3">
                                              <label className="fw-bold text-muted">Route Information</label>
                                              <div className="border rounded p-2 bg-light">
                                                <p className="mb-1"><strong>From:</strong> {train.fromStation} <small className="text-muted">(ID: {train.fromId})</small></p>
                                                <p className="mb-1"><strong>To:</strong> {train.toStation} <small className="text-muted">(ID: {train.toId})</small></p>
                                                <p className="mb-0"><strong>Off Day:</strong> {train.offDay || 'None'}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="row">
                                          <div className="col-12">
                                            <div className="mb-3">
                                              <label className="fw-bold text-muted">Status & Operations</label>
                                              <div className="border rounded p-2 bg-light">
                                                <p className="mb-1">
                                                  <strong>Current Status:</strong> 
                                                  <span className="badge bg-success ms-2">Active</span>
                                                </p>
                                                <p className="mb-0">
                                                  <strong>Last Updated:</strong> 
                                                  <span className="text-muted ms-2">{new Date().toLocaleDateString()}</span>
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-4">
                                        <div className="mb-3">
                                          <label className="fw-bold text-muted">Quick Actions</label>
                                          <div className="border rounded p-3 bg-light">
                                            <div className="d-grid gap-2">
                                              <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => navigate(`/admin/train/${train.trainId}`)}
                                              >
                                                <i className="fas fa-edit me-2"></i>
                                                Edit More Details
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleEdit(train)}
                                              >
                                                <i className="fas fa-pencil-alt me-2"></i>
                                                Quick Edit
                                              </button>
                                              <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => toggleExpandedRow(train.trainId)}
                                              >
                                                <i className="fas fa-chevron-up me-2"></i>
                                                Collapse Details
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mb-3">
                                          <label className="fw-bold text-muted">More Options</label>
                                          <div className="border rounded p-2 bg-light">
                                            <small className="text-muted">
                                              Use "Edit More Details" for comprehensive train management including schedules, routes, and advanced settings.
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTrains;
