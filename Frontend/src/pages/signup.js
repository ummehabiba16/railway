import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import api from "../api";

import Navbar from "../components/navBar";
import { useNavigate } from "react-router-dom";

function Signup() {
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

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNum: "",
        nid: "",
        gender: "",
        address: "",
        birthRegNum: "",
        dateOfBirth: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

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
        const { name, value } = e.target;

        // Special handling for phone number to allow only digits
        if (name === 'phoneNum') {
            // Remove all non-digit characters
            const cleanedValue = value.replace(/\D/g, '');
            // Limit to 11 digits
            const limitedValue = cleanedValue.slice(0, 11);
            setFormData({ ...formData, [name]: limitedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setMessage("");
    };

    const validateForm = () => {
        const errors = [];

        // Basic validation
        if (!formData.firstName.trim()) errors.push("নামের প্রথম অংশ প্রয়োজন");
        if (!formData.lastName.trim()) errors.push("নামের শেষ অংশ প্রয়োজন");
        if (!formData.email.trim()) errors.push("ইমেইল ঠিকানা প্রয়োজন");
        if (!formData.password.trim()) errors.push("পাসওয়ার্ড প্রয়োজন");

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.push("বৈধ ইমেইল ঠিকানা দিন");
        }

        // Phone number validation for Bangladesh
        if (formData.phoneNum && formData.phoneNum.trim()) {
            const phoneNum = formData.phoneNum.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses

            // Check if it contains only digits
            if (!/^\d+$/.test(phoneNum)) {
                errors.push("ফোন নম্বরে শুধুমাত্র সংখ্যা থাকতে পারে");
            }
            // Check length (11 digits for BD mobile numbers)
            else if (phoneNum.length !== 11) {
                errors.push("ফোন নম্বর অবশ্যই ১১ সংখ্যার হতে হবে");
            }
            // Check if it starts with 01 (Bangladesh mobile format)
            else if (!phoneNum.startsWith('01')) {
                errors.push("ফোন নম্বর অবশ্যই ০১ দিয়ে শুরু হতে হবে");
            }
            // Check valid operator prefixes for Bangladesh
            else {
                const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
                const prefix = phoneNum.substring(0, 3);
                if (!validPrefixes.includes(prefix)) {
                    errors.push("অবৈধ মোবাইল অপারেটর কোড। বৈধ কোড: ০১৩, ০১৪, ০১৫, ০১৬, ০১৭, ০১৮, ০১৯");
                }
            }
        }

        // Either NID or Birth Registration Number is required
        if (!formData.nid.trim() && !formData.birthRegNum.trim()) {
            errors.push("জাতীয় পরিচয়পত্র নম্বর অথবা জন্ম নিবন্ধন নম্বর প্রয়োজন");
        }

        // Password validation
        if (formData.password && formData.password.length < 4) {
            errors.push("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে");
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate form before submission
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setMessage(validationErrors.join(", "));
            setIsSuccess(false);
            setIsLoading(false);
            return;
        }

        try {
            console.log(formData);
            await api.post("/register", formData);
            setMessage("নিবন্ধন সফল হয়েছে!");
            setIsSuccess(true);

            // Delay navigation to show success message
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data || "নিবন্ধন ব্যর্থ হয়েছে";

            // Provide Bengali translations for specific error messages
            let translatedMessage = errorMessage;
            if (errorMessage.includes("Email already registered")) {
                translatedMessage = "এই ইমেইল ঠিকানা আগেই নিবন্ধিত হয়েছে।";
            } else if (errorMessage.includes("Database error") || errorMessage.includes("Unexpected error")) {
                translatedMessage = "ডাটাবেস ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
            }

            setMessage(translatedMessage);
            setIsSuccess(false);
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
                    {[...Array(15)].map((_, i) => (
                        <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
                    ))}
                </div>

                {/* Interactive Background Elements */}
                <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-2" style={{ y: backgroundY }}>
                    {/* Dynamic gradient orbs */}
                    <motion.div
                        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{
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
                        className="absolute top-1/2 right-20 w-48 h-48 rounded-full blur-3xl" style={{
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

                {/* Signup Content */}
                <main className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-12 z-30">
                    <div className="max-w-2xl w-full relative">
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
                                    নিবন্ধন করুন
                                </motion.h1>
                                <motion.p
                                    className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    নতুন অ্যাকাউন্ট তৈরি করুন
                                </motion.p>
                            </motion.div>

                            {/* Signup Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            প্রথম নাম *
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                            placeholder="আপনার প্রথম নাম"
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            শেষ নাম *
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                            placeholder="আপনার শেষ নাম"
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Email */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                >
                                    <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        ইমেইল *
                                    </label>
                                    <motion.input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                        placeholder="আপনার ইমেইল ঠিকানা"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                        }}
                                    />
                                </motion.div>

                                {/* Phone and NID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.6 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            ফোন নম্বর
                                        </label>
                                        <motion.input
                                            type="tel"
                                            name="phoneNum"
                                            value={formData.phoneNum}
                                            onChange={handleChange}
                                            maxLength="11"
                                            pattern="[0-9]{11}"
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                            placeholder="০১৭১২৩৪৫৬৭৮ (১১ সংখ্যা)"
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.7 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            জাতীয় পরিচয়পত্র নম্বর
                                        </label>
                                        <motion.input
                                            type="text"
                                            name="nid"
                                            value={formData.nid}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                            placeholder="NID নম্বর"
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Gender and Date of Birth */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.8 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            লিঙ্গ
                                        </label>
                                        <motion.select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900"
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        >
                                            <option value="">নির্বাচন করুন</option>
                                            <option value="M">পুরুষ</option>
                                            <option value="F">মহিলা</option>
                                            <option value="O">অন্যান্য</option>
                                        </motion.select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.9 }}
                                    >
                                        <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            জন্ম তারিখ
                                        </label>
                                        <motion.input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            min="1920-01-01"
                                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 cursor-pointer"
                                            style={{
                                                colorScheme: 'light'
                                            }}
                                            whileFocus={{
                                                scale: 1.02,
                                                boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Address */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 1.0 }}
                                >
                                    <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        ঠিকানা
                                    </label>
                                    <motion.input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                        placeholder="আপনার ঠিকানা"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                        }}
                                    />
                                </motion.div>

                                {/* Birth Registration Number */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 1.1 }}
                                >
                                    <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        জন্ম নিবন্ধন নম্বর
                                    </label>
                                    <motion.input
                                        type="text"
                                        name="birthRegNum"
                                        value={formData.birthRegNum}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                        placeholder="জন্ম নিবন্ধন নম্বর"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                        }}
                                    />
                                </motion.div>

                                {/* Password */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 1.2 }}
                                >
                                    <label className="block text-sm font-medium text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        পাসওয়ার্ড *
                                    </label>
                                    <motion.input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-blue-900 placeholder-blue-400"
                                        placeholder="একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(0,123,255,0.3)"
                                        }}
                                    />
                                </motion.div>

                                {/* Message */}
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`${isSuccess ? 'bg-green-100/80 border-green-300 text-green-700' : 'bg-red-100/80 border-red-300 text-red-700'} border px-4 py-3 rounded-xl backdrop-blur-sm`}
                                    >
                                        <div className="flex items-center">
                                            <motion.span
                                                animate={isSuccess ? { scale: [1, 1.2, 1] } : { rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 0.5 }}
                                                className="mr-2"
                                            >
                                                {isSuccess ? '✅' : '⚠️'}
                                            </motion.span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                {message}
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
                                    transition={{ duration: 0.8, delay: 1.3 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            <span>নিবন্ধন করা হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <>
                                            <motion.span
                                                animate={{ x: [0, 3, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                🚂
                                            </motion.span>
                                            <span>নিবন্ধন করুন</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Additional Links */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1.4 }}
                                className="mt-8 text-center"
                            >
                                <motion.p
                                    className="text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                                    <a href="/login" className="font-bold hover:text-orange-800 transition-colors duration-300">
                                        প্রবেশ করুন
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

export default Signup;
