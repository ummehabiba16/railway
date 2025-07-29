import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';

const AdminCancellation = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [selectedTrainId, setSelectedTrainId] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  
  // State for dropdowns
  const [trainNames, setTrainNames] = useState([]);
  const [coaches, setCoaches] = useState([]);
  
  // Loading states
  const [trainsLoading, setTrainsLoading] = useState(true);
  const [coachesLoading, setCoachesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch train names on component mount
  useEffect(() => {
    fetchTrainNames();
  }, []);

  // Fetch coaches when train is selected
  useEffect(() => {
    if (selectedTrainId) {
      fetchCoaches(selectedTrainId);
    } else {
      setCoaches([]);
      setSelectedCoachId('');
    }
  }, [selectedTrainId]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchTrainNames = async () => {
    try {
      setTrainsLoading(true);
      const response = await api.get('/admin/trains/names');
      const data = response.data;
      
      if (data.success) {
        setTrainNames(data.trains || []);
      } else {
        setErrorMessage(data.message || 'Failed to fetch train names');
      }
    } catch (error) {
      console.error('Error fetching train names:', error);
      setErrorMessage('Failed to connect to server');
    } finally {
      setTrainsLoading(false);
    }
  };

  const fetchCoaches = async (trainId) => {
    try {
      setCoachesLoading(true);
      // Extract train ID from the selected value (format: "TR0001 - Train Name")
      const actualTrainId = trainId.split(' - ')[0];
      const response = await api.get(`/admin/trains/${actualTrainId}/coaches`);
      const data = response.data;
      
      if (data.success) {
        setCoaches(data.coaches || []);
      } else {
        setErrorMessage(data.message || 'Failed to fetch coaches');
        setCoaches([]);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setErrorMessage('Failed to fetch coaches');
      setCoaches([]);
    } finally {
      setCoachesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTrainId) {
      setErrorMessage('Please select a train');
      return;
    }
    
    if (!travelDate) {
      setErrorMessage('Please select a travel date');
      return;
    }
    
    if (!selectedCoachId) {
      setErrorMessage('Please select a coach');
      return;
    }

    try {
      setSubmitLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Extract train ID from the selected value
      const trainId = selectedTrainId.split(' - ')[0];
      
      // Format date as DD-MM-YYYY
      const dateObj = new Date(travelDate);
      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
      
      const response = await api.post('/refund/admin/process', {
        trainId: trainId,
        travelDate: formattedDate,
        coachId: selectedCoachId
      });
      
      const data = response.data;
      
      if (data.success) {
        setSuccessMessage(data.message);
        // Reset form
        setSelectedTrainId('');
        setTravelDate('');
        setSelectedCoachId('');
        setCoaches([]);
      } else {
        setErrorMessage(data.message || 'Failed to process cancellation and refund');
      }
    } catch (error) {
      console.error('Error processing cancellation:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="fas fa-undo-alt me-2"></i>
                Cancellation & Refund Management
              </h2>
              <div>
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

        {/* Success Message */}
        {successMessage && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-success alert-dismissible fade show">
                <i className="fas fa-check-circle me-2"></i>
                {successMessage}
                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show">
                <i className="fas fa-exclamation-circle me-2"></i>
                {errorMessage}
                <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-secondary shadow">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-ban me-2"></i>
                  Process Cancellation and Refund
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text text-muted mb-4">
                  Select a train, travel date, and coach to process cancellations and refunds for that specific combination.
                </p>
                
                <form onSubmit={handleSubmit}>
                  {/* Train Selection */}
                  <div className="mb-4">
                    <label htmlFor="trainSelect" className="form-label fw-bold">
                      <i className="fas fa-train me-2"></i>
                      Select Train
                    </label>
                    {trainsLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading trains...
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        id="trainSelect"
                        value={selectedTrainId}
                        onChange={(e) => setSelectedTrainId(e.target.value)}
                        disabled={submitLoading}
                        required
                      >
                        <option value="">Choose a train...</option>
                        {trainNames.map((trainInfo, index) => (
                          <option key={index} value={trainInfo}>
                            {trainInfo}
                          </option>
                        ))}
                      </select>
                    )}
                    <small className="text-muted">
                      Select the train for cancellation and refund processing
                    </small>
                  </div>
                  
                  {/* Travel Date */}
                  <div className="mb-4">
                    <label htmlFor="travelDate" className="form-label fw-bold">
                      <i className="fas fa-calendar me-2"></i>
                      Travel Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="travelDate"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      disabled={submitLoading}
                      required
                    />
                    <small className="text-muted">
                      Select the travel date for processing cancellations
                    </small>
                  </div>
                  
                  {/* Coach Selection */}
                  <div className="mb-4">
                    <label htmlFor="coachSelect" className="form-label fw-bold">
                      <i className="fas fa-subway me-2"></i>
                      Select Coach
                    </label>
                    {!selectedTrainId ? (
                      <select className="form-select" disabled>
                        <option>Please select a train first</option>
                      </select>
                    ) : coachesLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading coaches...
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        id="coachSelect"
                        value={selectedCoachId}
                        onChange={(e) => setSelectedCoachId(e.target.value)}
                        disabled={submitLoading}
                        required
                      >
                        <option value="">Choose a coach...</option>
                        <option value="ALL">All Coaches</option>
                        {coaches.map((coach, index) => (
                          <option key={index} value={coach.coachId}>
                            {coach.coachName} (ID: {coach.coachId})
                          </option>
                        ))}
                      </select>
                    )}
                    <small className="text-muted">
                      Select the specific coach or all coaches for cancellation processing
                    </small>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-secondary btn-lg"
                      disabled={submitLoading || trainsLoading || coachesLoading}
                    >
                      {submitLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing Cancellation...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-ban me-2"></i>
                          Process Cancellation & Refund
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Important Information
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-secondary">Cancellation Process</h6>
                    <ul className="small">
                      <li>Select specific train, date, and coach for targeted cancellations</li>
                      <li>All affected passengers will be automatically notified</li>
                      <li>Refunds will be processed according to system rules</li>
                      <li>Use "All Coaches" option for train-wide cancellations</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-warning">Best Practices</h6>
                    <ul className="small">
                      <li>Process cancellations as early as possible</li>
                      <li>Coordinate with station masters before mass cancellations</li>
                      <li>Monitor refund processing status after submission</li>
                      <li>Keep records of cancellation reasons for auditing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCancellation;
