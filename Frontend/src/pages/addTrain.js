import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';
const AddTrain = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    trainNum: '',
    trainName: '',
    fromStationId: '',
    toStationId: '',
    offDay: ''
  });
  
  // Other state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Stations for dropdowns
  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

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
      setError('Failed to load stations');
    } finally {
      setStationsLoading(false);
    }
  };

  // Load stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing errors when user starts typing
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.trainNum.trim()) {
      setError('Train number is required');
      return false;
    }
    if (formData.trainNum.length > 6) {
      setError('Train number cannot exceed 6 characters');
      return false;
    }
    if (!formData.trainName.trim()) {
      setError('Train name is required');
      return false;
    }
    if (formData.trainName.length > 100) {
      setError('Train name cannot exceed 100 characters');
      return false;
    }
    if (!formData.fromStationId) {
      setError('From station is required');
      return false;
    }
    if (!formData.toStationId) {
      setError('To station is required');
      return false;
    }
    if (formData.fromStationId === formData.toStationId) {
      setError('From station and To station cannot be the same');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post("/admin/trains", formData);
      const data = response.data;
      
      if (data.success) {
        setSuccess(true);
        setFormData({
          trainNum: '',
          trainName: '',
          fromStationId: '',
          toStationId: '',
          offDay: ''
        });
        
        // Redirect to trains list after 2 seconds
        setTimeout(() => {
          navigate('/admin/trains');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create train');
      }
    } catch (error) {
      console.error('Error creating train:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Add New Train
              </h2>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin/trains')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Trains
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                Train created successfully! Redirecting to trains list...
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Add Train Form */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Train Information</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Train Number */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="trainNum" className="form-label">
                        Train Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="trainNum"
                        name="trainNum"
                        value={formData.trainNum}
                        onChange={handleInputChange}
                        maxLength="6"
                        placeholder="Enter train number"
                        required
                      />
                      <div className="form-text">Maximum 6 characters</div>
                    </div>

                    {/* Train Name */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="trainName" className="form-label">
                        Train Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="trainName"
                        name="trainName"
                        value={formData.trainName}
                        onChange={handleInputChange}
                        maxLength="100"
                        placeholder="Enter train name"
                        required
                      />
                      <div className="form-text">Maximum 100 characters</div>
                    </div>
                  </div>

                  <div className="row">
                    {/* From Station */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fromStationId" className="form-label">
                        From Station <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="fromStationId"
                        name="fromStationId"
                        value={formData.fromStationId}
                        onChange={handleInputChange}
                        required
                        disabled={stationsLoading}
                      >
                        <option value="">
                          {stationsLoading ? 'Loading stations...' : 'Select From Station'}
                        </option>
                        {fromStations.map((station) => (
                          <option key={station.stationId} value={station.stationId}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">Select the starting station</div>
                    </div>

                    {/* To Station */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="toStationId" className="form-label">
                        To Station <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="toStationId"
                        name="toStationId"
                        value={formData.toStationId}
                        onChange={handleInputChange}
                        required
                        disabled={stationsLoading}
                      >
                        <option value="">
                          {stationsLoading ? 'Loading stations...' : 'Select To Station'}
                        </option>
                        {toStations.map((station) => (
                          <option key={station.stationId} value={station.stationId}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">Select the destination station</div>
                    </div>
                  </div>

                  <div className="row">
                    {/* Off Day */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="offDay" className="form-label">
                        Off Day
                      </label>
                      <select
                        className="form-select"
                        id="offDay"
                        name="offDay"
                        value={formData.offDay}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Off Day (Optional)</option>
                        <option value="SUNDAY">Sunday</option>
                        <option value="MONDAY">Monday</option>
                        <option value="TUESDAY">Tuesday</option>
                        <option value="WEDNESDAY">Wednesday</option>
                        <option value="THURSDAY">Thursday</option>
                        <option value="FRIDAY">Friday</option>
                        <option value="SATURDAY">Saturday</option>
                      </select>
                      <div className="form-text">Day when this train does not operate</div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="row">
                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => navigate('/admin/trains')}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading || stationsLoading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Create Train
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTrain;
