import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProfileStationMaster() {
  const navigate = useNavigate();
  const [stationMasterInfo, setStationMasterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userId || userRole !== 'STATION_MASTER') {
      navigate('/login');
      return;
    }

    fetchStationMasterProfile();
  }, [navigate]);

  const fetchStationMasterProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/master/profile/${userId}`);
      
      setStationMasterInfo(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching station master profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/login');
      } else {
        setError('Failed to load profile. Please try again.');
      }
      setLoading(false);
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
            <p className="mt-2">Loading profile...</p>
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
          <div className="alert alert-danger">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">🚉 Station Master Profile</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="text-primary mb-3">Personal Information</h5>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Name</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.name || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.email || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Phone Number</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.phoneNum || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-success mb-3">Station Information</h5>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Station Name</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.stationName || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Location</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.stationLocation || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Division</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.stationDivision || 'N/A'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Station Contact</label>
                      <p className="form-control-plaintext border-bottom">{stationMasterInfo?.stationContactNum || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information Section */}
                <hr />
                <div className="row">
                  <div className="col-12">
                    <h5 className="text-info mb-3">Station Master Responsibilities</h5>
                    <div className="alert alert-info">
                      <p className="mb-2"><strong>Primary Duties:</strong></p>
                      <ul className="mb-0">
                        <li>Manage station operations and daily activities</li>
                        <li>Oversee ticket sales and passenger services</li>
                        <li>Coordinate with train operations and maintenance</li>
                        <li>Ensure safety protocols and regulations compliance</li>
                        <li>Handle customer complaints and emergency situations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileStationMaster;
