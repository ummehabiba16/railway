import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Navbar() {
    const navigate = useNavigate();
    const [navVisible, setNavVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setNavVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Check if user is logged in and get role
        const checkAuthStatus = () => {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("userRole");
            setIsLoggedIn(!!token);
            setUserRole(role || '');
        };

        checkAuthStatus();

        // Listen for storage changes
        window.addEventListener('storage', checkAuthStatus);

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

  const handleLogout = async () => {
    try {
      // Make the logout request
      await api.post("/logout");

      // Clear token and userId from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");

      // Update login state
      setIsLoggedIn(false);
      setUserRole('');

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      setUserRole('');
      navigate("/");
    }
  };

  // Get navigation items based on user role and login status
  const getNavigationItems = () => {
    const searchPath = userRole === 'STATION_MASTER' ? '/search/stationmaster' : '/search';
    
    const baseItems = [
      { label: "হোম", path: "/" },
      { label: "ট্রেনের তথ্য", path: "/trainInfo" },
      { label: "টিকিট কিনুন", path: searchPath }
    ];

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={navVisible ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        className="backdrop-blur-xl bg-white/20 border-b border-white/20"
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/")}
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 20px 40px rgba(255,107,53,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-2xl">🚂</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  গন্তব্য
                </span>
                <span className="text-xs text-orange-500 font-medium font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">রেলওয়ে সেবা</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="hidden md:flex items-center space-x-8"
            >
              {/* Navigation Items */}
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg relative font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{
                    scale: 1.1,
                    y: -3,
                    textShadow: "0 0 8px rgba(255,107,53,0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}

              {/* Show My Bookings, Profile and Logout only when user IS logged in */}
              {isLoggedIn && (
                <>
                  {/* Show different button text and route based on user role */}
                  {userRole === 'STATION_MASTER' ? (
                    <motion.button
                      className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg relative font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                      whileHover={{
                        scale: 1.1,
                        y: -3,
                        textShadow: "0 0 8px rgba(255,107,53,0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/bookings/stationMaster")}
                    >
                      রিফান্ড
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  ) : (
                    <motion.button
                      className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg relative font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                      whileHover={{
                        scale: 1.1,
                        y: -3,
                        textShadow: "0 0 8px rgba(255,107,53,0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/bookings")}
                    >
                      আমার বুকিং
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  )}
                </>
              )}

              {/* Authentication and Role-based Buttons */}
              {!isLoggedIn ? (
                <>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                      boxShadow: "0 10px 20px rgba(255,107,53,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => navigate('/login')}
                  >
                    লগইন
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                      boxShadow: "0 20px 40px rgba(255,107,53,0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:shadow-orange-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] border-none cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => navigate('/signup')}
                  >
                    সাইন আপ
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Role-based Profile Button */}
                  {userRole === 'USER' && (
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        boxShadow: "0 10px 20px rgba(255,107,53,0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => navigate('/user/profile')}
                    >
                      প্রোফাইল
                    </motion.button>
                  )}

                  {userRole === 'STATION_MASTER' && (
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        boxShadow: "0 10px 20px rgba(255,107,53,0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="text-orange-700 hover:text-orange-800 transition-colors duration-300 font-semibold text-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] bg-transparent border-none cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => navigate('/master/profile')}
                    >
                      স্টেশন মাস্টার
                    </motion.button>
                  )}

                  {/* Logout Button */}
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      y: -3,
                      boxShadow: "0 20px 40px rgba(220,38,38,0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:shadow-red-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] border-none cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={handleLogout}
                  >
                    লগআউট
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-orange-700 hover:text-orange-800 transition-colors duration-300 bg-transparent border-none cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar;