import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';

const AdminRules = () => {
  const navigate = useNavigate();
  
  // State for rules
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Rule configurations with metadata
  const ruleConfigs = [
    {
      key: 'ticketAvailableBefore',
      label: 'Ticket Available Before',
      description: 'Number of days before travel date that tickets become available',
      unit: 'days',
      endpoint: '/ticket-available-before',
      icon: 'calendar-alt',
      color: 'primary',
      maxValue: 90
    },
    {
      key: 'bookingHoldTime',
      label: 'Booking Hold Time',
      description: 'Time to hold booking before automatic cancellation',
      unit: 'minutes',
      endpoint: '/booking-hold-time',
      icon: 'clock',
      color: 'warning',
      maxValue: 999
    },
    {
      key: 'childFarePercentage',
      label: 'Child Fare Percentage',
      description: 'Percentage of adult fare charged for children',
      unit: '%',
      endpoint: '/child-fare-percentage',
      icon: 'child',
      color: 'success',
      maxValue: 100
    },
    {
      key: 'serviceCharge',
      label: 'Service Charge',
      description: 'Additional service charge per booking',
      unit: 'BDT',
      endpoint: '/service-charge',
      icon: 'money-bill-wave',
      color: 'info',
      maxValue: 999
    },
    {
      key: 'beddingCharge',
      label: 'Bedding Charge',
      description: 'Additional charge for bedding services',
      unit: 'BDT',
      endpoint: '/bedding-charge',
      icon: 'bed',
      color: 'secondary',
      maxValue: 999
    },
    {
      key: 'monthlyBookingLimit',
      label: 'Monthly Booking Limit',
      description: 'Maximum number of bookings per user per month',
      unit: 'bookings',
      endpoint: '/monthly-booking-limit',
      icon: 'calendar-check',
      color: 'danger',
      maxValue: 999
    },
    {
      key: 'blockingTime',
      label: 'Blocking Time',
      description: 'Time to block seats during booking process',
      unit: 'minutes',
      endpoint: '/blocking-time',
      icon: 'lock',
      color: 'dark',
      maxValue: 999
    }
  ];

  // Fetch current rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/rules');
      const data = response.data;
      
      if (data.success) {
        setRules(data.rules);
      } else {
        setError(data.message || 'Failed to fetch rules');
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle edit button click
  const handleEdit = (ruleConfig) => {
    setEditingField(ruleConfig.key);
    setEditValue(rules[ruleConfig.key] || '');
  };

  // Handle save edit
  const handleSave = async (ruleConfig) => {
    try {
      setSaveLoading(true);
      
      const value = parseInt(editValue);
      if (isNaN(value) || value < 0) {
        alert('Please enter a valid positive number');
        return;
      }
      
      if (value > ruleConfig.maxValue) {
        alert(`Value cannot exceed ${ruleConfig.maxValue}`);
        return;
      }

      const response = await api.put(`/admin/rules${ruleConfig.endpoint}`, { value });
      const data = response.data;
      
      if (data.success) {
        setEditingField(null);
        setSuccessMessage(data.message || `${ruleConfig.label} updated successfully!`);
        fetchRules(); // Refresh the rules
      } else {
        alert(data.message || 'Failed to update rule');
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      alert(error.response?.data?.message || 'Failed to connect to server');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
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
            <p className="mt-2">Loading system rules...</p>
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
              <button className="btn btn-outline-danger btn-sm me-2" onClick={fetchRules}>
                Retry
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/dashboard')}>
                Back to Dashboard
              </button>
            </div>
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
                <i className="fas fa-cogs me-2"></i>
                System Rules Management
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

        {/* Applied From Date */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-calendar me-2"></i>
                  Current Rules Configuration
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-0">
                  <strong>Applied From:</strong> {rules?.appliedFrom || 'Not set'}
                  <span className="badge bg-success ms-2">Active</span>
                </p>
                <small className="text-muted">
                  Rules are versioned by date. Changes create new rules effective from today.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="row">
          {ruleConfigs.map((ruleConfig) => (
            <div key={ruleConfig.key} className="col-lg-6 col-xl-4 mb-4">
              <div className={`card h-100 border-${ruleConfig.color}`}>
                <div className={`card-header bg-${ruleConfig.color} text-white`}>
                  <h6 className="mb-0">
                    <i className={`fas fa-${ruleConfig.icon} me-2`}></i>
                    {ruleConfig.label}
                  </h6>
                </div>
                <div className="card-body">
                  <p className="card-text small text-muted mb-3">
                    {ruleConfig.description}
                  </p>
                  
                  {editingField === ruleConfig.key ? (
                    // Edit Mode
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">New Value:</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            min="0"
                            max={ruleConfig.maxValue}
                            disabled={saveLoading}
                          />
                          <span className="input-group-text">{ruleConfig.unit}</span>
                        </div>
                        <small className="text-muted">
                          Max: {ruleConfig.maxValue} {ruleConfig.unit}
                        </small>
                      </div>
                      <div className="d-grid gap-2 d-md-flex">
                        <button
                          className="btn btn-success btn-sm flex-fill"
                          onClick={() => handleSave(ruleConfig)}
                          disabled={saveLoading}
                        >
                          <i className="fas fa-save me-1"></i>
                          {saveLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm flex-fill"
                          onClick={handleCancel}
                          disabled={saveLoading}
                        >
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Current Value:</label>
                        <div className={`h4 text-${ruleConfig.color}`}>
                          {rules?.[ruleConfig.key] || '0'} {ruleConfig.unit}
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          className={`btn btn-outline-${ruleConfig.color} btn-sm`}
                          onClick={() => handleEdit(ruleConfig)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit Value
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                    <h6 className="text-primary">How Rules Work</h6>
                    <ul className="small">
                      <li>Rules are versioned by date for audit purposes</li>
                      <li>Changes create new rules effective from today</li>
                      <li>System always uses the latest rules for new bookings</li>
                      <li>Existing bookings continue with their original rules</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-warning">Validation Limits</h6>
                    <ul className="small">
                      <li>All values must be positive numbers</li>
                      <li>Ticket availability: Max 90 days</li>
                      <li>Time values: Max 999 minutes</li>
                      <li>Percentage values: Max 100%</li>
                      <li>Monetary values: Max 999 BDT</li>
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

export default AdminRules;
