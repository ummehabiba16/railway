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
                  All Trains ({trains.length})
                </h6>
              </div>
              <div className="card-body">
                {trains.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-train fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No trains found</p>
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
                        {trains.map((train) => (
                          <tr key={train.trainId}>
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
                                  <button
                                    className="btn btn-success btn-sm me-1"
                                    onClick={() => handleSaveEdit(train.trainId)}
                                  >
                                    <i className="fas fa-save"></i>
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleCancelEdit}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
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
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleEdit(train)}
                                  >
                                    <i className="fas fa-edit me-1"></i>
                                    Edit
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
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
