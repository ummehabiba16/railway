import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.1) 70%, transparent 100%)',
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
              background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(236,72,153,0.2) 70%, transparent 100%)',
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
                className="text-4xl lg:text-5xl font-bold text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(59,130,246,0)",
                    "0 0 10px rgba(59,130,246,0.3)",
                    "0 0 0px rgba(59,130,246,0)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="mr-3">🎫</span>
                টিকিট ব্যবস্থাপনা
              </motion.h1>
              <p className="text-blue-600 text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                ট্রেনের টিকিট রিলিজ এবং বুকিং ব্যবস্থাপনা
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

          {/* Release Tickets Forms */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Release Tickets for All Trains */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full"
            >
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-6">
                  <h2 className="text-2xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] flex items-center">
                    <span className="mr-3">🌍</span>
                    টিকিট রিলিজ (সকল ট্রেন)
                  </h2>
                </div>
                
                <div className="p-8">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-700 text-lg mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                  >
                    নির্দিষ্ট তারিখে সকল ট্রেনের টিকিট রিলিজ করুন। এটি সিস্টেমের সকল ট্রেনের জন্য টিকিট বুকিং সক্রিয় করবে।
                  </motion.p>
                  
                  <form onSubmit={handleReleaseAllTrains} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-3"
                    >
                      <label className="block text-lg font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        <span className="mr-2">📅</span>
                        যাত্রার তারিখ
                      </label>
                      <motion.input
                        type="date"
                        className="w-full px-4 py-4 bg-white/70 backdrop-blur-sm border border-blue-300 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        value={allTrainsDate}
                        onChange={(e) => setAllTrainsDate(e.target.value)}
                        disabled={allTrainsLoading}
                        required
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: "0 0 20px rgba(59,130,246,0.3)"
                        }}
                      />
                      <p className="text-blue-600 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        আজ থেকে শুরু করে যেকোনো তারিখ নির্বাচন করুন
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="pt-4"
                    >
                      <motion.button
                        type="submit"
                        disabled={allTrainsLoading}
                        className={`
                          ${allTrainsLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:shadow-blue-300'
                          } 
                          text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 
                          flex items-center justify-center space-x-3 w-full
                          font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]
                        `}
                        whileHover={!allTrainsLoading ? {
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(59,130,246,0.4)"
                        } : {}}
                        whileTap={!allTrainsLoading ? { scale: 0.98 } : {}}
                      >
                        {allTrainsLoading ? (
                          <>
                            <motion.div
                              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>টিকিট রিলিজ করা হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              🚀
                            </motion.span>
                            <span>সকল ট্রেনের টিকিট রিলিজ করুন</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Release Tickets for Specific Train */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full"
            >
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden h-full">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-6">
                  <h2 className="text-2xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] flex items-center">
                    <span className="mr-3">🚆</span>
                    নির্দিষ্ট ট্রেনের টিকিট রিলিজ
                  </h2>
                </div>
                
                <div className="p-8">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-orange-700 text-lg mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                  >
                    নির্দিষ্ট ট্রেন এবং তারিখের জন্য টিকিট রিলিজ করুন। এটি নির্বাচনীয় টিকিট রিলিজের সুবিধা দেয়।
                  </motion.p>
                  
                  <form onSubmit={handleReleaseSpecificTrain} className="space-y-6">
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
                          value={specificTrainId}
                          onChange={(e) => setSpecificTrainId(e.target.value)}
                          disabled={specificTrainLoading}
                          required
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(251,146,60,0.3)"
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
                        যে ট্রেনের টিকিট রিলিজ করতে চান তা নির্বাচন করুন
                      </p>
                    </motion.div>
                    
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
                        value={specificTrainDate}
                        onChange={(e) => setSpecificTrainDate(e.target.value)}
                        disabled={specificTrainLoading}
                        required
                        whileFocus={{
                          scale: 1.02,
                          boxShadow: "0 0 20px rgba(251,146,60,0.3)"
                        }}
                      />
                      <p className="text-orange-600 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        আজ থেকে শুরু করে যেকোনো তারিখ নির্বাচন করুন
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="pt-4"
                    >
                      <motion.button
                        type="submit"
                        disabled={specificTrainLoading || trainsLoading}
                        className={`
                          ${specificTrainLoading || trainsLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:shadow-orange-300'
                          } 
                          text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 
                          flex items-center justify-center space-x-3 w-full
                          font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]
                        `}
                        whileHover={!specificTrainLoading && !trainsLoading ? {
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(251,146,60,0.4)"
                        } : {}}
                        whileTap={!specificTrainLoading && !trainsLoading ? { scale: 0.98 } : {}}
                      >
                        {specificTrainLoading ? (
                          <>
                            <motion.div
                              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>টিকিট রিলিজ করা হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              🚀
                            </motion.span>
                            <span>নির্বাচিত ট্রেনের টিকিট রিলিজ করুন</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4">
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
                    <h4 className="text-lg font-bold text-purple-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      টিকিট রিলিজ প্রক্রিয়া
                    </h4>
                    <ul className="space-y-2 text-purple-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>আজ থেকে শুরু করে যেকোনো তারিখের জন্য টিকিট রিলিজ করা যায়</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>টিকিট রিলিজ করলে যাত্রী বুকিং করতে পারবে</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>একবার রিলিজ করা টিকিট আর ফেরত নেওয়া যায় না</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>সকল ট্রেন অপশন সিস্টেম-ব্যাপী টিকিট রিলিজ করে</span>
                      </li>
                    </ul>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-bold text-purple-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      সর্বোত্তম অনুশীলন
                    </h4>
                    <ul className="space-y-2 text-purple-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>ভালো বুকিং হারের জন্য আগেই টিকিট রিলিজ করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>নির্বাচনীয় প্রাপ্যতার জন্য নির্দিষ্ট ট্রেন রিলিজ ব্যবহার করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>ব্যাপক রিলিজের আগে সিস্টেম ক্ষমতা পর্যবেক্ষণ করুন</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>পিক ট্রাভেল তারিখের জন্য স্টেশন মাস্টারদের সাথে সমন্বয় করুন</span>
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

export default AdminTickets;
