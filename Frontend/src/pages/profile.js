import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/navBar';
import api from '../api';

function Profile() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Background animation
    const backgroundColor = useTransform(
        scrollY,
        [0, 300, 600, 900],
        [
            "linear-gradient(135deg, #FFF7ED 0%, #FFE4E1 50%, #E0F2FE 100%)",
            "linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 50%, #E17055 100%)",
            "linear-gradient(135deg, #74B9FF 0%, #0984E3 50%, #A29BFE 100%)",
            "linear-gradient(135deg, #FD79A8 0%, #FDCB6E 50%, #E84393 100%)"
        ]
    );

    const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);

    // Mouse tracking for interactive elements
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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

    // Handle birth registration number validation
    if (name === 'birthRegNum') {
      // Only allow numbers and limit to 17 digits
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 17) {
        setEditForm(prev => ({
          ...prev,
          [name]: cleanValue
        }));
      }
      return;
    }

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

  const canEditBirthRegNum = () => {
    // Birth registration number can only be set if not already set
    return !userInfo?.birthRegNum || userInfo.birthRegNum.trim() === '';
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

  // Floating Particle Component
  const FloatingParticle = ({ delay, size }) => (
    <motion.div
      className={`absolute ${size === 1 ? 'w-2 h-2' : 'w-3 h-3'} bg-orange-300 rounded-full opacity-30`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 50 - 25, 0],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );

  if (loading) {
    return (
      <div ref={containerRef} className="relative overflow-hidden min-h-screen">
        <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />
        <Navbar />

        {/* Ambient Elements */}
        <div className="fixed inset-0 pointer-events-none z-1">
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
          ))}
        </div>

        <main className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-12 z-30">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl"
          >
            <motion.div
              className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h2 className="text-2xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
              প্রোফাইল লোড হচ্ছে...
            </h2>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-screen">
      <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />
      <Navbar />

      {/* Ambient Elements */}
      <div className="fixed inset-0 pointer-events-none z-1">
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
        ))}
      </div>

      {/* Interactive Background Elements */}
      <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-2" style={{ y: backgroundY }}>
        {/* Dynamic gradient orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(255,165,0,0.1) 0%, rgba(255,69,0,0.05) 70%, transparent 100%)`,
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-20 w-48 h-48 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,140,0,0.08) 70%, transparent 100%)`,
            x: mousePosition.x * -0.005,
            y: mousePosition.y * -0.005,
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <main className="relative min-h-screen px-6 pt-32 pb-12 z-30">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-black text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,102,0,0)",
                  "0 0 10px rgba(255,102,0,0.3)",
                  "0 0 0px rgba(255,102,0,0)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              👤 আমার প্রোফাইল
            </motion.h1>
            <motion.p
              className="text-orange-600 text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              আপনার ব্যক্তিগত তথ্য পরিচালনা করুন
            </motion.p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
          >
            {/* Edit Button Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📋</span>
                <h2 className="text-2xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  প্রোফাইল তথ্য
                </h2>
              </div>
              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                >
                  ✏️ প্রোফাইল এডিট করুন
                </motion.button>
              )}
            </div>

            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="relative inline-block">
                {userInfo?.profileImage || imagePreview ? (
                  <motion.img
                    src={imagePreview || `data:image/jpeg;base64,${userInfo.profileImage}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                    whileHover={{ scale: 1.05 }}
                  />
                ) : (
                  <motion.div
                    className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-4xl">👤</span>
                  </motion.div>
                )}

                {editing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profileImageInput"
                    />
                    <motion.label
                      htmlFor="profileImageInput"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl font-bold cursor-pointer shadow-lg hover:shadow-green-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>📷</span>
                      <span>{userInfo?.profileImage || imagePreview ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
                    </motion.label>
                    <p className="text-sm text-orange-600 mt-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      সর্বোচ্চ আকার: ৫ এমবি
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  প্রথম নাম
                </label>
                {editing ? (
                  <motion.input
                    type="text"
                    name="firstName"
                    value={editForm.firstName || ''}
                    onChange={handleInputChange}
                    maxLength="50"
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900 placeholder-orange-400"
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  />
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {userInfo?.firstName || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>

              {/* Last Name */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  শেষ নাম
                </label>
                {editing ? (
                  <motion.input
                    type="text"
                    name="lastName"
                    value={editForm.lastName || ''}
                    onChange={handleInputChange}
                    maxLength="50"
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900 placeholder-orange-400"
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  />
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {userInfo?.lastName || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  ইমেইল
                </label>
                {editing ? (
                  <div>
                    <motion.input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleInputChange}
                      maxLength="50"
                      disabled
                      className="w-full px-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-xl text-gray-600 cursor-not-allowed"
                      title="Email cannot be changed"
                    />
                    <p className="text-xs text-orange-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      📧 নিরাপত্তার কারণে ইমেইল পরিবর্তন করা যাবে না
                    </p>
                  </div>
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {userInfo?.email || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>

              {/* Phone Number */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  ফোন নম্বর
                </label>
                {editing ? (
                  <div>
                    <motion.input
                      type="tel"
                      name="phoneNum"
                      value={editForm.phoneNum || ''}
                      onChange={handleInputChange}
                      maxLength="20"
                      disabled
                      className="w-full px-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-xl text-gray-600 cursor-not-allowed"
                      title="Phone number cannot be changed"
                    />
                    <p className="text-xs text-orange-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      📱 নিরাপত্তার কারণে ফোন নম্বর পরিবর্তন করা যাবে না
                    </p>
                  </div>
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {userInfo?.phoneNum || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>

              {/* National ID (NID) - Only show for adults */}
              {shouldShowNID() && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="space-y-2"
                >
                  <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    জাতীয় পরিচয়পত্র (এনআইডি)
                  </label>
                  {editing ? (
                    <div>
                      <motion.input
                        type="text"
                        name="nid"
                        value={editForm.nid || ''}
                        onChange={handleInputChange}
                        maxLength="20"
                        disabled={!canEditNID()}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${canEditNID()
                          ? 'bg-white/30 border border-white/50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-900 placeholder-orange-400'
                          : 'bg-gray-100/50 border border-gray-300/50 text-gray-600 cursor-not-allowed'
                          }`}
                        title={!canEditNID() ? "NID cannot be changed once set" : "Enter your National ID"}
                        whileFocus={canEditNID() ? {
                          scale: 1.02,
                          boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                        } : {}}
                      />
                      {!canEditNID() && userInfo?.nid && (
                        <p className="text-xs text-orange-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          🆔 একবার সেট করার পর এনআইডি পরিবর্তন করা যাবে না
                        </p>
                      )}
                      {canEditNID() && (
                        <p className="text-xs text-green-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          🆔 আপনি আপনার এনআইডি সেট করতে পারেন (১৮+ বছর বয়সী)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                      {userInfo?.nid || 'নির্দিষ্ট নয়'}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Gender */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  লিঙ্গ
                </label>
                {editing ? (
                  <motion.select
                    name="gender"
                    value={editForm.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900"
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="M">পুরুষ</option>
                    <option value="F">মহিলা</option>
                    <option value="O">অন্যান্য</option>
                  </motion.select>
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {getGenderText(userInfo?.gender)}
                  </p>
                )}
              </motion.div>

              {/* Birth Registration Number */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  জন্ম নিবন্ধন নম্বর
                </label>
                {editing ? (
                  <div>
                    <motion.input
                      type="text"
                      name="birthRegNum"
                      value={editForm.birthRegNum || ''}
                      onChange={handleInputChange}
                      maxLength="17"
                      disabled={!canEditBirthRegNum()}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${canEditBirthRegNum()
                        ? 'bg-white/30 border border-white/50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-900 placeholder-orange-400'
                        : 'bg-gray-100/50 border border-gray-300/50 text-gray-600 cursor-not-allowed'
                        }`}
                      placeholder="১৭ ডিজিটের জন্ম নিবন্ধন নম্বর"
                      title={!canEditBirthRegNum() ? "Birth registration number cannot be changed once set" : "Enter your birth registration number (17 digits)"}
                      whileFocus={canEditBirthRegNum() ? {
                        scale: 1.02,
                        boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                      } : {}}
                    />
                    {!canEditBirthRegNum() && userInfo?.birthRegNum && (
                      <p className="text-xs text-orange-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        📜 একবার সেট করার পর জন্ম নিবন্ধন নম্বর পরিবর্তন করা যাবে না
                      </p>
                    )}
                    {canEditBirthRegNum() && (
                      <p className="text-xs text-green-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        📜 আপনি আপনার জন্ম নিবন্ধন নম্বর সেট করতে পারেন (১৭ ডিজিট)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {userInfo?.birthRegNum || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>

              {/* Date of Birth */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  জন্ম তারিখ
                </label>
                {editing ? (
                  <div>
                    <motion.input
                      type="date"
                      name="dateOfBirth"
                      value={formatDateForInput(editForm.dateOfBirth)}
                      onChange={handleInputChange}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-xl text-gray-600 cursor-not-allowed"
                      title="Date of birth cannot be changed"
                    />
                    <p className="text-xs text-orange-600 mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      📅 জন্ম তারিখ পরিবর্তন করা যাবে না
                    </p>
                  </div>
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900">
                    {formatDate(userInfo?.dateOfBirth)}
                  </p>
                )}
              </motion.div>

              {/* Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="md:col-span-2 space-y-2"
              >
                <label className="block text-orange-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  ঠিকানা
                </label>
                {editing ? (
                  <motion.textarea
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleInputChange}
                    rows="3"
                    maxLength="200"
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900 placeholder-orange-400 resize-none"
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  />
                ) : (
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-orange-900 min-h-[80px]">
                    {userInfo?.address || 'নির্দিষ্ট নয়'}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-end mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-gray-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ বাতিল করুন
                </motion.button>
                <motion.button
                  whileHover={!loading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-xl shadow-2xl backdrop-blur-xl border min-w-[300px] max-w-[400px] ${
              notification.type === 'error' ? 'bg-red-500/20 border-red-300 text-red-800' :
              notification.type === 'success' ? 'bg-green-500/20 border-green-300 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-300 text-yellow-800' :
              'bg-blue-500/20 border-blue-300 text-blue-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-lg">
                  {notification.type === 'success' && '✅'}
                  {notification.type === 'error' && '❌'}
                  {notification.type === 'warning' && '⚠️'}
                  {notification.type === 'info' && 'ℹ️'}
                </span>
                <p className="font-medium font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] flex-1">
                  {notification.message}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeNotification(notification.id)}
                className="text-current opacity-70 hover:opacity-100 ml-2"
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
