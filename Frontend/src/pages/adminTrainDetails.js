import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';

const AdminTrainDetails = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  
  // State for train details
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
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
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch train details
  const fetchTrainDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/admin/trains/${trainId}`);
      const data = response.data;
      
      if (data.success) {
        setTrain(data.train);
        setEditFormData({
          trainNum: data.train.trainNum,
          trainName: data.train.trainName,
          fromStationId: data.train.fromId,
          toStationId: data.train.toId,
          offDay: data.train.offDay || ''
        });
      } else {
        setError(data.message || 'Failed to fetch train details');
      }
    } catch (error) {
      console.error('Error fetching train details:', error);
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
    if (trainId) {
      fetchTrainDetails();
      fetchStations();
    }
  }, [trainId]);

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      const response = await api.put(`/admin/trains/${trainId}`, editFormData);
      const data = response.data;
      
      if (data.success) {
        setIsEditing(false);
        fetchTrainDetails(); // Refresh the details
        alert('Train updated successfully!');
      } else {
        alert(data.message || 'Failed to update train');
      }
    } catch (error) {
      console.error('Error updating train:', error);
      alert('Failed to connect to server');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (train) {
      setEditFormData({
        trainNum: train.trainNum,
        trainName: train.trainName,
        fromStationId: train.fromId,
        toStationId: train.toId,
        offDay: train.offDay || ''
      });
    }
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
            <p className="mt-2">Loading train details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            {error}
            <div>
              <button className="btn btn-outline-danger btn-sm me-2" onClick={fetchTrainDetails}>
                Retry
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/trains')}>
                Back to Trains
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!train) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="text-center">
            <div className="text-muted display-6">Train not found</div>
            <p className="text-muted mt-2">The requested train could not be found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/trains')}>
              Back to Trains
            </button>
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
                Train Details - {train.trainName}
              </h2>
              <div>
                <button 
                  className="btn btn-secondary me-2"
                  onClick={() => navigate('/admin/trains')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Trains
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Train Details Card */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">
                  Train Information
                </h6>
                <div>
                  {!isEditing ? (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Train
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveEdit}
                        disabled={saveLoading}
                      >
                        <i className="fas fa-save me-2"></i>
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                        disabled={saveLoading}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                {!isEditing ? (
                  // View Mode
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train Number:</label>
                        <p className="form-control-plaintext">{train.trainNum}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train Name:</label>
                        <p className="form-control-plaintext">{train.trainName}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">From Station:</label>
                        <p className="form-control-plaintext">{train.fromStation}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">To Station:</label>
                        <p className="form-control-plaintext">{train.toStation}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Off Day:</label>
                        <p className="form-control-plaintext">{train.offDay || 'None'}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train ID:</label>
                        <p className="form-control-plaintext text-muted">{train.trainId}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train Number:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="trainNum"
                          value={editFormData.trainNum}
                          onChange={handleEditInputChange}
                          maxLength="6"
                          required
                          disabled={saveLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="trainName"
                          value={editFormData.trainName}
                          onChange={handleEditInputChange}
                          maxLength="100"
                          required
                          disabled={saveLoading}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">From Station:</label>
                        <select
                          className="form-select"
                          name="fromStationId"
                          value={editFormData.fromStationId}
                          onChange={handleEditInputChange}
                          required
                          disabled={saveLoading || stationsLoading}
                        >
                          <option value="">Select From Station</option>
                          {fromStations.map((station) => (
                            <option key={station.stationId} value={station.stationId}>
                              {station.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">To Station:</label>
                        <select
                          className="form-select"
                          name="toStationId"
                          value={editFormData.toStationId}
                          onChange={handleEditInputChange}
                          required
                          disabled={saveLoading || stationsLoading}
                        >
                          <option value="">Select To Station</option>
                          {toStations.map((station) => (
                            <option key={station.stationId} value={station.stationId}>
                              {station.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Off Day:</label>
                        <select
                          className="form-select"
                          name="offDay"
                          value={editFormData.offDay}
                          onChange={handleEditInputChange}
                          disabled={saveLoading}
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
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Train ID:</label>
                        <p className="form-control-plaintext text-muted">{train.trainId}</p>
                      </div>
                    </div>
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

export default AdminTrainDetails;
