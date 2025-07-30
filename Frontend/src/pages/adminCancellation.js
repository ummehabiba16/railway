import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255,165,0,0.3) 0%, rgba(255,69,0,0.1) 70%, transparent 100%)',
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
            className="absolute top-1/2 right-20 w-48 h-48 rounded-full blur-3xl opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(255,69,0,0.4) 0%, rgba(255,20,147,0.2) 70%, transparent 100%)',
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
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
          >
            <div className="mb-4 lg:mb-0">
              <motion.h1
                className="text-4xl lg:text-5xl font-bold text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
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
                <span className="mr-3">🔄</span>
                ক্যান্সেলেশন ও রিফান্ড ব্যবস্থাপনা
              </motion.h1>
              <p className="text-orange-600 text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                ট্রেন বাতিলকরণ এবং যাত্রীদের অর্থ ফেরত প্রক্রিয়া
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(107,114,128,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>←</span>
              <span>ড্যাশবোর্ডে ফিরুন</span>
            </motion.button>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-green-100/80 border border-green-300 text-green-800 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-3 text-2xl"
                    >
                      ✅
                    </motion.span>
                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      {successMessage}
                    </span>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="text-green-600 hover:text-green-800 font-bold text-xl transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-red-100/80 border border-red-300 text-red-800 px-6 py-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">⚠️</span>
                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      {errorMessage}
                    </span>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="text-red-600 hover:text-red-800 font-bold text-xl transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6">
                  <h2 className="text-2xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] flex items-center">
                    <span className="mr-3">🚫</span>
                    ক্যান্সেলেশন ও রিফান্ড প্রক্রিয়াকরণ
                  </h2>
                </div>
                
                <div className="p-8">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-orange-700 text-lg mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                  >
                    নির্দিষ্ট ট্রেন, যাত্রার তারিখ এবং কোচ নির্বাচন করে ক্যান্সেলেশন ও রিফান্ড প্রক্রিয়া সম্পন্ন করুন।
                  </motion.p>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Train Selection */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-3"
                    >
                      <label className="block text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        <span className="mr-2">🚆</span>
                        ট্রেন নির্বাচন করুন
                      </label>
                      {trainsLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            ট্রেনের তালিকা লোড হচ্ছে...
                          </span>
                        </div>
                      ) : (
                        <motion.select
                          className="w-full px-4 py-4 bg-white/70 backdrop-blur-sm border border-orange-300 rounded-xl text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                          value={selectedTrainId}
                          onChange={(e) => setSelectedTrainId(e.target.value)}
                          disabled={submitLoading}
                          required
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                          }}
                        >
                          <option value="">একটি ট্রেন নির্বাচন করুন...</option>
                          {trainNames.map((trainInfo, index) => (
                            <option key={index} value={trainInfo}>
                              {trainInfo}
                            </option>
                          ))}
                        </motion.select>
                      )}
                      <p className="text-orange-600 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        ক্যান্সেলেশন ও রিফান্ড প্রক্রিয়ার জন্য ট্রেন নির্বাচন করুন
                      </p>
                    </motion.div>
                    
                    {/* Travel Date */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <label className="block text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        <span className="mr-2">📅</span>
                        যাত্রার তারিখ
                      </label>
                      <motion.input
                        type="date"
                        className="w-full px-4 py-4 bg-white/70 backdrop-blur-sm border border-orange-300 rounded-xl text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        disabled={submitLoading}
                        required
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                        }}
                      />
                      <p className="text-orange-600 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        ক্যান্সেলেশন প্রক্রিয়ার জন্য যাত্রার তারিখ নির্বাচন করুন
                      </p>
                    </motion.div>
                    
                    {/* Coach Selection */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-3"
                    >
                      <label className="block text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        <span className="mr-2">🚃</span>
                        কোচ নির্বাচন করুন
                      </label>
                      {!selectedTrainId ? (
                        <select className="w-full px-4 py-4 bg-gray-200 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]" disabled>
                          <option>প্রথমে একটি ট্রেন নির্বাচন করুন</option>
                        </select>
                      ) : coachesLoading ? (
                        <div className="text-center py-8">
                          <motion.div
                            className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            কোচের তালিকা লোড হচ্ছে...
                          </span>
                        </div>
                      ) : (
                        <motion.select
                          className="w-full px-4 py-4 bg-white/70 backdrop-blur-sm border border-orange-300 rounded-xl text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                          value={selectedCoachId}
                          onChange={(e) => setSelectedCoachId(e.target.value)}
                          disabled={submitLoading}
                          required
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                          }}
                        >
                          <option value="">একটি কোচ নির্বাচন করুন...</option>
                          <option value="ALL">সব কোচ</option>
                          {coaches.map((coach, index) => (
                            <option key={index} value={coach.coachId}>
                              {coach.coachName} (আইডি: {coach.coachId})
                            </option>
                          ))}
                        </motion.select>
                      )}
                      <p className="text-orange-600 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        ক্যান্সেলেশন প্রক্রিয়ার জন্য নির্দিষ্ট কোচ বা সব কোচ নির্বাচন করুন
                      </p>
                    </motion.div>
                    
                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-center pt-4"
                    >
                      <motion.button
                        type="submit"
                        disabled={submitLoading || trainsLoading || coachesLoading}
                        className={`
                          ${submitLoading || trainsLoading || coachesLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:shadow-orange-300'
                          } 
                          text-white px-12 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 
                          flex items-center justify-center space-x-3 mx-auto 
                          font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]
                        `}
                        whileHover={!submitLoading && !trainsLoading && !coachesLoading ? {
                          scale: 1.05,
                          boxShadow: "0 25px 50px rgba(255,102,0,0.4)"
                        } : {}}
                        whileTap={!submitLoading && !trainsLoading && !coachesLoading ? { scale: 0.95 } : {}}
                      >
                        {submitLoading ? (
                          <>
                            <motion.div
                              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>ক্যান্সেলেশন প্রক্রিয়া করা হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              🚫
                            </motion.span>
                            <span>ক্যান্সেলেশন ও রিফান্ড প্রক্রিয়া করুন</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8"
          >
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4">
                <h3 className="text-xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] flex items-center">
                  <span className="mr-3">ℹ️</span>
                  গুরুত্বপূর্ণ তথ্য
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      ক্যান্সেলেশন প্রক্রিয়া
                    </h4>
                    <ul className="space-y-2 text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>লক্ষ্যযুক্ত ক্যান্সেলেশনের জন্য নির্দিষ্ট ট্রেন, তারিখ এবং কোচ নির্বাচন করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>সমস্ত ক্ষতিগ্রস্ত যাত্রীদের স্বয়ংক্রিয়ভাবে অবহিত করা হবে</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>সিস্টেম নিয়ম অনুসারে রিফান্ড প্রক্রিয়া করা হবে</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>ট্রেন-ব্যাপী ক্যান্সেলেশনের জন্য "সব কোচ" বিকল্প ব্যবহার করুন</span>
                      </li>
                    </ul>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      সর্বোত্তম অনুশীলন
                    </h4>
                    <ul className="space-y-2 text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>যত তাড়াতাড়ি সম্ভব ক্যান্সেলেশন প্রক্রিয়া করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>ব্যাপক ক্যান্সেলেশনের আগে স্টেশন মাস্টারদের সাথে সমন্বয় করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>জমা দেওয়ার পরে রিফান্ড প্রক্রিয়াকরণের অবস্থা পর্যবেক্ষণ করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>অডিটিংয়ের জন্য ক্যান্সেলেশনের কারণগুলির রেকর্ড রাখুন</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminCancellation;
