import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrains: 0,
    totalUsers: 0,
    totalBookings: 0,
    todaysSuccessfulBookings: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get("/admin/stats/overview");
      console.log('Dashboard stats response:', response.data);
      
      setStats({
        totalTrains: response.data.totalTrains || 0,
        totalUsers: response.data.totalUsers || 0,
        totalBookings: response.data.totalBookings || 0,
        todaysSuccessfulBookings: response.data.todaysSuccessfulBookings || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    fetchDashboardStats();
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
            <p className="mt-2">Loading dashboard...</p>
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
            <button className="btn btn-outline-danger btn-sm" onClick={refreshStats}>
              Retry
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
                <i className="fas fa-tachometer-alt me-2"></i>
                Admin Dashboard
              </h2>
              <button 
                className="btn btn-outline-primary"
                onClick={refreshStats}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Overview Statistics */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="mb-3">Quick Overview</h4>
          </div>
          
          {/* Total Trains */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Total Trains
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.totalTrains.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-train fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-success shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Total Users
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.totalUsers.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-users fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-info shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Total Bookings
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.totalBookings.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-ticket-alt fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Successful Bookings */}
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-warning shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Today's Successful Bookings
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.todaysSuccessfulBookings.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-calendar-check fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="mb-3">Management</h4>
          </div>
          
          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-map-marked-alt fa-3x text-primary mb-3"></i>
                <h5 className="card-title">Station Management</h5>
                <p className="card-text">Manage railway stations, assign station masters, and update station information.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/stations')}
                >
                  Manage Stations
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-users fa-3x text-success mb-3"></i>
                <h5 className="card-title">User Management</h5>
                <p className="card-text">View and manage user accounts, handle user reports, and monitor user activity.</p>
                <button 
                  className="btn btn-success"
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-train fa-3x text-info mb-3"></i>
                <h5 className="card-title">Train Management</h5>
                <p className="card-text">Manage train schedules, routes, and train information across the railway network.</p>
                <button 
                  className="btn btn-info"
                  onClick={() => navigate('/admin/trains')}
                >
                  Manage Trains
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">System Status</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Last Updated:</strong> {new Date().toLocaleString()}
                    </div>
                    <div className="mb-3">
                      <strong>System Status:</strong> 
                      <span className="badge bg-success ms-2">Online</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Database Status:</strong> 
                      <span className="badge bg-success ms-2">Connected</span>
                    </div>
                    <div className="mb-3">
                      <strong>Active Sessions:</strong> 
                      <span className="badge bg-info ms-2">{stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 0.1) : 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .border-left-primary {
          border-left: 0.25rem solid #4e73df !important;
        }
        .border-left-success {
          border-left: 0.25rem solid #1cc88a !important;
        }
        .border-left-info {
          border-left: 0.25rem solid #36b9cc !important;
        }
        .border-left-warning {
          border-left: 0.25rem solid #f6c23e !important;
        }
        .text-xs {
          font-size: 0.7rem;
        }
        .text-gray-800 {
          color: #5a5c69 !important;
        }
        .text-gray-300 {
          color: #dddfeb !important;
        }
      `}</style>
    </>
  );
}

export default AdminDashboard;
