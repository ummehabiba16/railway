import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/navBar';
import api from '../api';

function ProfileStationMaster() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [stationMasterInfo, setStationMasterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
              স্টেশন মাস্টার প্রোফাইল লোড হচ্ছে...
            </h2>
          </motion.div>
        </main>
      </div>
    );
  }

  if (error) {
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
            className="text-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-12 shadow-2xl max-w-md"
          >
            <span className="text-6xl mb-4 block">❌</span>
            <h2 className="text-2xl font-bold text-red-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
              ত্রুটি
            </h2>
            <p className="text-red-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
              {error}
            </p>
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
        <div className="max-w-6xl mx-auto">
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
              🚉 স্টেশন মাস্টার প্রোফাইল
            </motion.h1>
            <motion.p
              className="text-orange-600 text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              স্টেশন পরিচালনা ও ব্যক্তিগত তথ্য
            </motion.p>
          </motion.div>

          {/* Profile Cards Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">👤</span>
                <h2 className="text-2xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  ব্যক্তিগত তথ্য
                </h2>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-blue-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    নাম
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-blue-900">
                    {stationMasterInfo?.name || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="block text-blue-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    ইমেইল
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-blue-900">
                    {stationMasterInfo?.email || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="block text-blue-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    ফোন নম্বর
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-blue-900">
                    {stationMasterInfo?.phoneNum || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Station Information Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">🚆</span>
                <h2 className="text-2xl font-bold text-green-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  স্টেশন তথ্য
                </h2>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-green-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    স্টেশনের নাম
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-green-900">
                    {stationMasterInfo?.stationName || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="block text-green-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    অবস্থান
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-green-900">
                    {stationMasterInfo?.stationLocation || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="block text-green-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    বিভাগ
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-green-900">
                    {stationMasterInfo?.stationDivision || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="block text-green-700 font-bold text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    স্টেশন যোগাযোগ
                  </label>
                  <p className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-green-900">
                    {stationMasterInfo?.stationContactNum || 'নির্দিষ্ট নয়'}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Responsibilities Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">📋</span>
              <h2 className="text-2xl font-bold text-purple-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                স্টেশন মাস্টারের দায়িত্ব
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-purple-100/20 backdrop-blur-sm border border-purple-200/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-purple-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                প্রধান কর্তব্য:
              </h3>
              <ul className="space-y-3 text-purple-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  <span>স্টেশন পরিচালনা এবং দৈনন্দিন কার্যক্রম তত্ত্বাবধান</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  <span>টিকিট বিক্রয় এবং যাত্রী সেবা তত্ত্বাবধান</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  <span>ট্রেন পরিচালনা এবং রক্ষণাবেক্ষণের সাথে সমন্বয়</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  <span>নিরাপত্তা প্রোটোকল এবং নিয়মাবলী মেনে চলা নিশ্চিত করা</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  <span>গ্রাহক অভিযোগ এবং জরুরি পরিস্থিতি পরিচালনা</span>
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default ProfileStationMaster;
