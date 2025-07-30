import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import api from "../api";
import Navbar from "../components/navBar";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);

    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax transforms
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);
    const cloudY = useTransform(scrollY, [0, 1000], [0, -50]);

    // Blue gradient background matching the landing page theme
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password } = credentials;

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      console.log(credentials);
      console.log(JSON.stringify(credentials));

      const response = await api.post("/login", credentials); // Change endpoint as needed
      setSuccess('Login successful!');
      setError('');
      
      const { userId, token } = response.data;
      
      // Store token and user ID in localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      
      // Decode token to get role and store it securely
      // For better security, you could use sessionStorage instead of localStorage for sensitive data
      try {
        // Extract role from JWT token payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userRole', payload.role);
        console.log('User role:', payload.role);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
      
      console.log(response.data);
      
      // Navigate based on role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error navigating based on role:', err);
        navigate('/');
      }
    } catch (err) {
      setError('Login failed. Check credentials.'+ err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

    // Floating particles for ambiance
    const FloatingParticle = ({ delay = 0, size = 2 }) => (
        <motion.div
            className={`absolute w-${size} h-${size} bg-orange-300/20 rounded-full blur-sm`}
            initial={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                y: typeof window !== 'undefined' ? window.innerHeight + 100 : 0,
                opacity: 0
            }}
            animate={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                y: -100,
                opacity: [0, 0.8, 0.8, 0]
            }}
            transition={{
                duration: 15 + Math.random() * 10,
                delay: delay + Math.random() * 5,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );

    // Enhanced cloud component
    const Cloud = ({ className = "", delay = 0, scale = 1 }) => (
        <motion.div
            style={{ y: cloudY }}
            initial={{ x: -150, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale }}
            transition={{
                duration: 4 + delay,
                delay,
                ease: "easeOut"
            }}
            className={`absolute ${className}`}
        >
            <motion.div
                animate={{
                    x: [0, 15, -5, 0],
                    rotate: [0, 1, -1, 0]
                }}
                transition={{
                    duration: 8 + delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <motion.svg
                    width={120 * scale}
                    height={60 * scale}
                    viewBox="0 0 120 60"
                    className="drop-shadow-lg"
                    whileHover={{ scale: 1.05 }}
                >
                    <path
                        d="M20 40 Q20 20, 40 20 Q50 10, 70 20 Q90 15, 90 35 Q100 40, 90 50 L20 50 Z"
                        fill="white"
                        opacity="0.8"
                    />
                </motion.svg>
            </motion.div>
        </motion.div>
    );

  return (
    <>
      <Navbar />
      <div ref={containerRef} className="relative overflow-hidden min-h-screen">
        <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />

        {/* Ambient Elements */}
        <div className="fixed inset-0 pointer-events-none z-1">
          {/* Floating Particles */}
          {[...Array(10)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
          ))}
        </div>

        {/* Interactive Background Elements */}
        <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-2" style={{ y: backgroundY }}>
          {/* Dynamic gradient orbs */}
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, rgba(255,102,0,0.1) 0%, rgba(255,69,0,0.05) 70%, transparent 100%)`,
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
              background: `radial-gradient(circle, rgba(255,69,0,0.15) 0%, rgba(255,20,147,0.08) 70%, transparent 100%)`,
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

          {/* Clouds */}
          <Cloud className="top-16 left-1/4" delay={0} scale={0.8} />
          <Cloud className="top-24 right-1/4" delay={1.5} scale={1.2} />
          <Cloud className="top-32 left-3/4" delay={3} scale={0.9} />
          <Cloud className="top-12 right-1/3" delay={2} scale={0.7} />
        </motion.div>

        {/* Login Content */}
        <main className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-12 z-30">
          <div className="max-w-md w-full relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.h1
                  className="text-4xl font-bold text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
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
                  প্রবেশ করুন
                </motion.h1>
                <motion.p
                  className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  আপনার অ্যাকাউন্টে প্রবেশ করুন
                </motion.p>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    ইমেইল *
                  </label>
                  <motion.input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900 placeholder-orange-400"
                    placeholder="আপনার ইমেইল দিন"
                    required
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    পাসওয়ার্ড *
                  </label>
                  <motion.input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900 placeholder-orange-400"
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    required
                    whileFocus={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                    }}
                  />
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100/80 border border-red-300 text-red-700 px-4 py-3 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="mr-2"
                      >
                        ⚠️
                      </motion.span>
                      <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        {error}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-100/80 border border-green-300 text-green-700 px-4 py-3 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="mr-2"
                      >
                        ✅
                      </motion.span>
                      <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                        {success}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{
                    scale: isLoading ? 1 : 1.05,
                    boxShadow: isLoading ? "0 10px 30px rgba(255,102,0,0.3)" : "0 25px 50px rgba(255,102,0,0.4)"
                  }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>প্রবেশ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🚂
                      </motion.span>
                      <span>প্রবেশ করুন</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Additional Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 text-center space-y-4"
              >
                <motion.p
                  className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                  whileHover={{ scale: 1.05 }}
                >
                  নতুন অ্যাকাউন্ট প্রয়োজন?{" "}
                  <a href="/signup" className="font-bold hover:text-orange-800 transition-colors duration-300">
                    নিবন্ধন করুন
                  </a>
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;
