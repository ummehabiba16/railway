import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';

const AdminTickets = () => {
  const navigate = useNavigate();
  
  // State for all trains release
  const [allTrainsDate, setAllTrainsDate] = useState('');
  const [allTrainsLoading, setAllTrainsLoading] = useState(false);
  
  // State for specific train release
  const [specificTrainId, setSpecificTrainId] = useState('');
  const [specificTrainDate, setSpecificTrainDate] = useState('');
  const [specificTrainLoading, setSpecificTrainLoading] = useState(false);
  
  // State for train names
  const [trainNames, setTrainNames] = useState([]);
  const [trainsLoading, setTrainsLoading] = useState(true);
  
  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch train names on component mount
  useEffect(() => {
    fetchTrainNames();
  }, []);

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

  const handleReleaseAllTrains = async (e) => {
    e.preventDefault();
    
    if (!allTrainsDate) {
      setErrorMessage('Please select a date');
      return;
    }

    try {
      setAllTrainsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const response = await api.post('/admin/tickets/release-all', {
        date: allTrainsDate
      });
      
      const data = response.data;
      
      if (data.success) {
        setSuccessMessage(data.message);
        setAllTrainsDate('');
      } else {
        setErrorMessage(data.message || 'Failed to release tickets');
      }
    } catch (error) {
      console.error('Error releasing tickets for all trains:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setAllTrainsLoading(false);
    }
  };

  const handleReleaseSpecificTrain = async (e) => {
    e.preventDefault();
    
    if (!specificTrainId) {
      setErrorMessage('Please select a train');
      return;
    }
    
    if (!specificTrainDate) {
      setErrorMessage('Please select a date');
      return;
    }

    try {
      setSpecificTrainLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Extract train ID from the selected value (format: "TR0001 - Train Name")
      const trainId = specificTrainId.split(' - ')[0];
      
      const response = await api.post('/admin/tickets/release-train', {
        trainId: trainId,
        date: specificTrainDate
      });
      
      const data = response.data;
      
      if (data.success) {
        setSuccessMessage(data.message);
        setSpecificTrainId('');
        setSpecificTrainDate('');
      } else {
        setErrorMessage(data.message || 'Failed to release tickets');
      }
    } catch (error) {
      console.error('Error releasing tickets for specific train:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setSpecificTrainLoading(false);
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
                <i className="fas fa-ticket-alt me-2"></i>
                Ticket Management
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

        {/* Release Tickets Forms */}
        <div className="row">
          {/* Release Tickets for All Trains */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-globe me-2"></i>
                  Release Tickets
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text text-muted mb-4">
                  Release tickets of all trains on a particular date. This will make tickets available for booking across all trains in the system.
                </p>
                
                <form onSubmit={handleReleaseAllTrains}>
                  <div className="mb-3">
                    <label htmlFor="allTrainsDate" className="form-label fw-bold">
                      <i className="fas fa-calendar me-2"></i>
                      Travel Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="allTrainsDate"
                      value={allTrainsDate}
                      onChange={(e) => setAllTrainsDate(e.target.value)}
                      disabled={allTrainsLoading}
                      required
                    />
                    <small className="text-muted">
                      Select any date from today onwards for ticket release
                    </small>
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={allTrainsLoading}
                    >
                      {allTrainsLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Releasing Tickets...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-rocket me-2"></i>
                          Release Tickets for All Trains
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Release Tickets for Specific Train */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100 border-warning">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-train me-2"></i>
                  Release Tickets of a Particular Train
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text text-muted mb-4">
                  Release tickets for a specific train and date. This allows selective ticket release for individual trains.
                </p>
                
                <form onSubmit={handleReleaseSpecificTrain}>
                  <div className="mb-3">
                    <label htmlFor="specificTrain" className="form-label fw-bold">
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
                        id="specificTrain"
                        value={specificTrainId}
                        onChange={(e) => setSpecificTrainId(e.target.value)}
                        disabled={specificTrainLoading}
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
                      Select the train for which you want to release tickets
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="specificTrainDate" className="form-label fw-bold">
                      <i className="fas fa-calendar me-2"></i>
                      Travel Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="specificTrainDate"
                      value={specificTrainDate}
                      onChange={(e) => setSpecificTrainDate(e.target.value)}
                      disabled={specificTrainLoading}
                      required
                    />
                    <small className="text-muted">
                      Select any date from today onwards for ticket release
                    </small>
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={specificTrainLoading || trainsLoading}
                    >
                      {specificTrainLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Releasing Tickets...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-rocket me-2"></i>
                          Release Tickets for Selected Train
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
                    <h6 className="text-primary">Ticket Release Process</h6>
                    <ul className="small">
                      <li>Tickets can be released for any date from today onwards</li>
                      <li>Releasing tickets makes them available for passenger booking</li>
                      <li>Once released, tickets cannot be un-released</li>
                      <li>All trains option releases tickets system-wide</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-warning">Best Practices</h6>
                    <ul className="small">
                      <li>Release tickets well in advance for better booking rates</li>
                      <li>Use specific train release for selective availability</li>
                      <li>Monitor system capacity before mass releases</li>
                      <li>Coordinate with station masters for peak travel dates</li>
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

export default AdminTickets;
