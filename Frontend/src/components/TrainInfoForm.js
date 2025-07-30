import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./navBar";

function TrainInfoForm() {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax transforms
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);
    const cloudY = useTransform(scrollY, [0, 1000], [0, -50]);

    // Blue gradient background matching the theme
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    const [fromStations, setFromStations] = useState([]);
    const [toStations, setToStations] = useState([]);
    const [trains, setTrains] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [searchData, setSearchData] = useState({
        fromStation: "",
        toStation: ""
    });

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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [fromRes, toRes] = await Promise.all([
                    api.get("/public/stations/from"),
                    api.get("/public/stations/to"),
                ]);

                setFromStations(fromRes.data);
                setToStations(toRes.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError("তথ্য লোডিং এ সমস্যা হয়েছে।");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        try {
            console.log(searchData);
            const res = await api.post("/public/trains", searchData);
            setTrains(res.data);
            setRouteDetails(null); // Reset route details when new search is made
        } catch (err) {
            console.error("Search error:", err);
            setError("ট্রেন খোঁজায় সমস্যা হয়েছে।");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleShowDetails = async (trainId) => {
        console.log("Train ID:", trainId);
        try {
            const response = await api.post("/public/fullDetails", { trainId: trainId });
            setRouteDetails(response.data);
            console.log("Route details:", response.data);
        } catch (err) {
            console.error("Search error:", err);
            setError("রুট বিস্তারিত তথ্য পাওয়া যাচ্ছে না।");
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

    if (loading) {
        return (
            <div ref={containerRef} className="relative overflow-hidden min-h-screen">
                <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />
                <Navbar />

                <div className="fixed inset-0 pointer-events-none z-1">
                    {[...Array(20)].map((_, i) => (
                        <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
                    ))}
                </div>

                <div className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-30">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="inline-block text-6xl mb-4"
                        >
                            🚂
                        </motion.div>
                        <h2 className="text-3xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            তথ্য লোড হচ্ছে...
                        </h2>
                    </motion.div>
                </div>
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

                {/* Clouds */}
                <Cloud className="top-16 left-1/4" delay={0} scale={1.2} />
                <Cloud className="top-24 right-1/4" delay={1.5} scale={0.9} />
                <Cloud className="top-32 left-3/4" delay={3} scale={1.1} />
                <Cloud className="top-40 left-1/8" delay={4.5} scale={0.8} />
            </motion.div>

            {/* Main Content */}
            <main className="relative min-h-screen px-6 pt-24 pb-12 z-30">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl md:text-6xl font-black text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            ট্রেনের তথ্য
                        </h1>
                        <p className="text-xl text-orange-600 max-w-2xl mx-auto font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            আপনার পছন্দের রুটের সকল ট্রেনের বিস্তারিত তথ্য দেখুন
                        </p>
                    </motion.div>

                    {/* Search Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl mb-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-lg font-semibold text-orange-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        যাত্রা শুরুর স্টেশন
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-300 rounded-xl text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        name="fromStation"
                                        value={searchData.fromStation}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">স্টেশন নির্বাচন করুন</option>
                                        {fromStations.map((st) => (
                                            <option key={st.stationId} value={st.stationId}>
                                                {st.name}
                                            </option>
                                        ))}
                                    </select>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-lg font-semibold text-orange-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        গন্তব্য স্টেশন
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-300 rounded-xl text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        name="toStation"
                                        value={searchData.toStation}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">স্টেশন নির্বাচন করুন</option>
                                        {toStations.map((st) => (
                                            <option key={st.stationId} value={st.stationId}>
                                                {st.name}
                                            </option>
                                        ))}
                                    </select>
                                </motion.div>
                            </div>

                            <motion.div
                                className="flex justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <button
                                    type="submit"
                                    disabled={searchLoading}
                                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-12 py-4 rounded-full font-bold text-xl shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                >
                                    {searchLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            <span>খোঁজা হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🔍</span>
                                            <span>ট্রেন খুঁজুন</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 backdrop-blur-sm border border-red-300 rounded-xl p-4 mb-8 text-red-800 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Train Results */}
                    {trains && trains.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="space-y-12"
                        >
                            <h2 className="text-3xl font-bold text-orange-800 text-center mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                উপলব্ধ ট্রেনসমূহ
                            </h2>

                            {/* Each train takes full width */}
                            {trains.map((train, index) => (
                                <motion.div
                                    key={train.trainId}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.2 }}
                                    className="w-full"
                                >
                                    {/* Train Info Header */}
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl mb-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <motion.div
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="text-5xl"
                                                >
                                                    🚂
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-orange-800 mb-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                        ট্রেন নং: {train.trainNum}
                                                    </h3>
                                                    <p className="text-xl text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                        নাম: {train.trainName}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleShowDetails(train.trainId)}
                                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                            >
                                                বিস্তারিত দেখুন
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    {/* Full Width Route Details */}
                                    {routeDetails && routeDetails.some(r => r.trainId === train.trainId) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.8 }}
                                            className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl"
                                        >
                                            <h4 className="text-2xl font-bold text-orange-800 mb-8 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                🚂 {train.trainName} - রুট বিবরণ
                                            </h4>

                                            {/* Horizontal Route Display */}
                                            <div className="relative overflow-x-auto pb-4">
                                                <div className="flex items-center space-x-4 min-w-max px-4">
                                                    {routeDetails
                                                        .filter(r => r.trainId === train.trainId)
                                                        .sort((a, b) => a.routeSequence - b.routeSequence)
                                                        .map((step, stepIndex, array) => (
                                                            <motion.div
                                                                key={stepIndex}
                                                                initial={{ opacity: 0, y: 50 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.6, delay: stepIndex * 0.1 }}
                                                                className="relative flex flex-col items-center min-w-[280px]"
                                                            >
                                                                {/* Station Icon */}
                                                                <motion.div
                                                                    whileHover={{ scale: 1.2 }}
                                                                    className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl border-4 border-white/60 mb-4"
                                                                >
                                                                    <motion.div
                                                                        animate={{ rotate: [0, 360] }}
                                                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                                        className="text-3xl"
                                                                    >
                                                                        {stepIndex === 0 ? "🚉" : stepIndex === array.length - 1 ? "🏁" : "🚏"}
                                                                    </motion.div>
                                                                </motion.div>

                                                                {/* Railway Track Connection - Fixed positioning */}
                                                                {stepIndex < array.length - 1 && (
                                                                    <div className="absolute top-10 left-1/2 w-[284px] h-1 bg-orange-500 z-0">
                                                                        <div className="absolute top-[-2px] left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
                                                                        {/* Railway Sleepers */}
                                                                        {[...Array(9)].map((_, i) => (
                                                                            <div key={i} className={`absolute top-[-3px] w-1.5 h-2 bg-orange-700 rounded-full`} style={{ left: `${i * 30 + 20}px` }}></div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Station Information Card */}
                                                                <motion.div
                                                                    whileHover={{ scale: 1.02, y: -5 }}
                                                                    className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 min-h-[160px] w-full"
                                                                >
                                                                    <div className="text-center">
                                                                        <h5 className="font-bold text-orange-800 text-lg mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                            {step.stationName}
                                                                        </h5>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-center space-x-2">
                                                                                <span className="text-green-600 font-bold">🟢</span>
                                                                                <p className="text-sm text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                                    আগমন: <span className="font-semibold">{step.arrivalTime || "শুরুর স্টেশন"}</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center justify-center space-x-2">
                                                                                <span className="text-red-600 font-bold">🔴</span>
                                                                                <p className="text-sm text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                                    প্রস্থান: <span className="font-semibold">{step.departureTime || "শেষ স্টেশন"}</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Station Sequence Number */}
                                                                        <motion.div
                                                                            whileHover={{ rotate: 360 }}
                                                                            transition={{ duration: 0.5 }}
                                                                            className="mt-3 mx-auto flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full font-bold text-sm"
                                                                        >
                                                                            {stepIndex + 1}
                                                                        </motion.div>
                                                                    </div>
                                                                </motion.div>
                                                            </motion.div>
                                                        ))}

                                                    {/* Animated Train Moving on Track */}
                                                    <motion.div
                                                        className="absolute top-6 left-10 z-20"
                                                        animate={{
                                                            x: [0, (routeDetails.filter(r => r.trainId === train.trainId).length - 1) * 284 + 130]
                                                        }}
                                                        transition={{
                                                            duration: 12,
                                                            repeat: Infinity,
                                                            repeatType: "reverse",
                                                            ease: "easeInOut"
                                                        }}
                                                    >
                                                        <motion.div
                                                            animate={{
                                                                y: [0, -3, 0]
                                                            }}
                                                            transition={{
                                                                y: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                                            }}
                                                            className="text-3xl drop-shadow-lg"
                                                        >
                                                            🚂
                                                        </motion.div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Route Summary */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="mt-6 text-center bg-blue-500/20 backdrop-blur-sm rounded-xl p-4"
                                            >
                                                <p className="text-blue-800 font-semibold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    মোট স্টেশন: {routeDetails.filter(r => r.trainId === train.trainId).length} টি
                                                </p>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : trains && trains.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-center py-16"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-6xl mb-4"
                            >
                                😔
                            </motion.div>
                            <h3 className="text-2xl font-bold text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                কোন ট্রেন পাওয়া যায়নি
                            </h3>
                            <p className="text-lg text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                অন্য রুট দিয়ে আবার চেষ্টা করুন
                            </p>
                        </motion.div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}

export default TrainInfoForm;
