import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navBar';
import api from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaCamera, FaUpload } from 'react-icons/fa';

function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Notification functions
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message) => showNotification(message, 'success');
  const showError = (message) => showNotification(message, 'error');
  const showInfo = (message) => showNotification(message, 'info');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      const response = await api.get(`/user/profile/${userId}`);
      
      if (response.status === 200) {
        setUserInfo(response.data);
        setEditForm(response.data);
      }
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      } else {
        showError('Error loading profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const isAdult = () => {
    return calculateAge(userInfo?.dateOfBirth) >= 18;
  };

  const canEditNID = () => {
    // NID can only be updated if:
    // 1. User is 18 or older AND
    // 2. NID is not already set
    return isAdult() && (!userInfo?.nid || userInfo.nid.trim() === '');
  };

  const shouldShowNID = () => {
    // Show NID field only if user is 18 or older
    return isAdult();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      const formData = new FormData();
      formData.append('userId', userId);
      
      // Only append fields that have changed
      if (editForm.firstName !== userInfo.firstName) {
        formData.append('firstName', editForm.firstName || '');
      }
      if (editForm.lastName !== userInfo.lastName) {
        formData.append('lastName', editForm.lastName || '');
      }
      if (editForm.email !== userInfo.email) {
        formData.append('email', editForm.email || '');
      }
      if (editForm.phoneNum !== userInfo.phoneNum) {
        formData.append('phoneNum', editForm.phoneNum || '');
      }
      if (editForm.nid !== userInfo.nid) {
        formData.append('nid', editForm.nid || '');
      }
      if (editForm.gender !== userInfo.gender) {
        formData.append('gender', editForm.gender || '');
      }
      if (editForm.address !== userInfo.address) {
        formData.append('address', editForm.address || '');
      }
      if (editForm.birthRegNum !== userInfo.birthRegNum) {
        formData.append('birthRegNum', editForm.birthRegNum || '');
      }
      // Note: dateOfBirth is immutable and should never be sent for updates
      
      // Always include profile image if a new one is selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await api.put("/user/profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setUserInfo(response.data);
        setEditing(false);
        setProfileImage(null);
        setImagePreview(null);
        showSuccess('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Error updating profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(userInfo);
    setEditing(false);
    setProfileImage(null);
    setImagePreview(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'Not specified';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your profile...</p>
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
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">👤 My Profile</h4>
                  {!editing && (
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* Profile Image */}
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    {userInfo?.profileImage || imagePreview ? (
                      <img
                        src={imagePreview || `data:image/jpeg;base64,${userInfo.profileImage}`}
                        alt="Profile"
                        className="rounded-circle border"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle border bg-light d-flex align-items-center justify-content-center"
                        style={{ width: '150px', height: '150px' }}
                      >
                        <FaUser size={60} className="text-muted" />
                      </div>
                    )}
                    
                    {editing && (
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="d-none"
                          id="profileImageInput"
                        />
                        <label htmlFor="profileImageInput" className="btn btn-outline-primary btn-sm">
                          <FaCamera className="me-2" />
                          {userInfo?.profileImage || imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <div className="mt-1">
                          <small className="text-muted">Max size: 5MB</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Information */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={editForm.firstName || ''}
                        onChange={handleInputChange}
                        maxLength="50"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.firstName || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={editForm.lastName || ''}
                        onChange={handleInputChange}
                        maxLength="50"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.lastName || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Email</label>
                    {editing ? (
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editForm.email || ''}
                        onChange={handleInputChange}
                        maxLength="50"
                        disabled
                        title="Email cannot be changed"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.email || 'Not specified'}</p>
                    )}
                    {editing && (
                      <small className="text-muted">📧 Email cannot be changed for security reasons</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNum"
                        value={editForm.phoneNum || ''}
                        onChange={handleInputChange}
                        maxLength="20"
                        disabled
                        title="Phone number cannot be changed"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.phoneNum || 'Not specified'}</p>
                    )}
                    {editing && (
                      <small className="text-muted">📱 Phone number cannot be changed for security reasons</small>
                    )}
                  </div>

                  {shouldShowNID() && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">National ID (NID)</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="nid"
                          value={editForm.nid || ''}
                          onChange={handleInputChange}
                          maxLength="20"
                          disabled={!canEditNID()}
                          title={!canEditNID() ? "NID cannot be changed once set" : "Enter your National ID"}
                        />
                      ) : (
                        <p className="form-control-plaintext">{userInfo?.nid || 'Not specified'}</p>
                      )}
                      {editing && !canEditNID() && userInfo?.nid && (
                        <small className="text-muted">🆔 NID cannot be changed once set</small>
                      )}
                      {editing && canEditNID() && (
                        <small className="text-success">🆔 You can set your NID (18+ years old)</small>
                      )}
                    </div>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Gender</label>
                    {editing ? (
                      <select
                        className="form-select"
                        name="gender"
                        value={editForm.gender || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    ) : (
                      <p className="form-control-plaintext">{getGenderText(userInfo?.gender)}</p>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Birth Registration Number</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="birthRegNum"
                        value={editForm.birthRegNum || ''}
                        onChange={handleInputChange}
                        maxLength="20"
                        disabled
                        title="Birth registration number cannot be changed"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.birthRegNum || 'Not specified'}</p>
                    )}
                    {editing && (
                      <small className="text-muted">📜 Birth registration number cannot be changed</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date of Birth</label>
                    {editing ? (
                      <div>
                        <input
                          type="date"
                          className="form-control"
                          name="dateOfBirth"
                          value={formatDateForInput(editForm.dateOfBirth)}
                          onChange={handleInputChange}
                          disabled
                          title="Date of birth cannot be changed"
                        />
                        <small className="text-muted">📅 Date of birth cannot be changed</small>
                      </div>
                    ) : (
                      <div>
                        <p className="form-control-plaintext">{formatDate(userInfo?.dateOfBirth)}</p>
                      </div>
                    )}
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">Address</label>
                    {editing ? (
                      <textarea
                        className="form-control"
                        name="address"
                        value={editForm.address || ''}
                        onChange={handleInputChange}
                        rows="3"
                        maxLength="200"
                      />
                    ) : (
                      <p className="form-control-plaintext">{userInfo?.address || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {editing && (
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      ❌ Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        '💾 Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Container */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`alert alert-${
              notification.type === 'error' ? 'danger' :
              notification.type === 'success' ? 'success' :
              notification.type === 'warning' ? 'warning' : 'info'
            } alert-dismissible fade show shadow-sm mb-2 notification-slide-in`}
            role="alert"
            style={{ 
              minWidth: '300px',
              maxWidth: '400px'
            }}
          >
            <div className="d-flex align-items-start">
              <div className="me-2">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
              </div>
              <div className="flex-grow-1">
                {notification.message}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .notification-slide-in {
            animation: slideInRight 0.3s ease-out;
          }
        `
      }} />
    </>
  );
}

export default Profile;
