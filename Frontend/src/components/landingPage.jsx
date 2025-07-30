import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform, useInView } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./navBar";

export default function LandingPage() {
    const navigate = useNavigate();
    const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const trainControls = useAnimation();
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);

    // Function to handle navigation based on user role
    const handleTicketBooking = () => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'STATION_MASTER') {
            navigate("/search/stationmaster");
        } else {
            navigate('/search');
        }
    };

    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax transforms - reduced intensity to prevent conflicts
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);
    const heroY = useTransform(scrollY, [0, 1000], [0, 50]); // Reduced movement
    const trainY = useTransform(scrollY, [0, 1000], [0, 100]); // Reduced movement
    const cloudY = useTransform(scrollY, [0, 1000], [0, -50]);

    // Color transitions
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    const isHeroInView = useInView(heroRef, { threshold: 0.3 });
    const isFeaturesInView = useInView(featuresRef, { threshold: 0.2 });

    useEffect(() => {
        const seenHero = sessionStorage.getItem("seenHeroAnimation");
        if (!seenHero) {
            sessionStorage.setItem("seenHeroAnimation", "true");
            setTimeout(() => setHeroAnimationComplete(true), 3000);
        } else {
            setHeroAnimationComplete(true);
        }
    }, []);

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
        if (isHeroInView) {
            trainControls.start({
                x: 0,
                opacity: 1,
                transition: { duration: 2.5, ease: "easeOut" }
            });
        }
    }, [isHeroInView, trainControls]);

    // Advanced smoke particle with physics
    const SmokeParticle = ({ delay = 0, duration = 6, index = 0 }) => {
        const xOffset = Math.sin(index * 0.5) * 4; // Very tight to chimney opening
        const yOffset = -60 - (index * 8);

        return (
            <motion.div
                className="absolute w-2 h-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"
                initial={{
                    x: xOffset,
                    y: 0, // Start right at chimney top
                    scale: 0.2,
                    opacity: 0.8
                }}
                animate={{
                    x: [xOffset, xOffset + Math.sin(index) * 20, xOffset + Math.cos(index) * 12],
                    y: [0, yOffset * 0.7, yOffset], // Gradual rise from chimney
                    scale: [0.2, 0.8, 1.4, 0],
                    opacity: [0.8, 0.6, 0.3, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, 0.3, 0.7, 1]
                }}
            />
        );
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

    // Enhanced cloud component with depth
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

    const TextReveal = ({ children, delay = 0, className = "", shouldAnimate = true }) => {
        const animationProps = shouldAnimate && !heroAnimationComplete
            ? {
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] }
            }
            : {
                initial: { opacity: 1, y: 0 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0 }
            };
        return <motion.div className={className} {...animationProps}>{children}</motion.div>;
    };

    return (
        <div ref={containerRef} className="relative overflow-hidden">
            <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />

            <Navbar />

            {/* Ambient Elements */}
            <div className="fixed inset-0 pointer-events-none z-1">                                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <FloatingParticle key={i} delay={i * 2} size={Math.random() > 0.5 ? 1 : 2} />
                ))}
            </div>

            {/* Interactive Background Elements */}
            <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-2" style={{ y: backgroundY }}>
                {/* Dynamic gradient orbs - Reduced mouse sensitivity */}
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

                {/* Enhanced Clouds with depth - More clouds added */}
                <Cloud className="top-16 left-1/4" delay={0} scale={1.2} />
                <Cloud className="top-24 right-1/4" delay={1.5} scale={0.9} />
                <Cloud className="top-32 left-3/4" delay={3} scale={1.1} />
                <Cloud className="top-40 left-1/8" delay={4.5} scale={0.8} />
                <Cloud className="top-12 right-1/3" delay={2} scale={0.7} />
                <Cloud className="top-28 left-1/2" delay={3.5} scale={1.0} />
                <Cloud className="top-44 right-2/3" delay={5} scale={0.9} />
                <Cloud className="top-20 left-2/3" delay={1} scale={0.6} />
                <Cloud className="top-36 right-1/8" delay={4} scale={1.3} />
            </motion.div>

            {/* Hero Section */}
            <main ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-30">
                <div className="max-w-6xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10 relative z-40">
                            <TextReveal delay={0.3} shouldAnimate={!heroAnimationComplete} className="space-y-4">
                                <motion.h1
                                    className="text-6xl md:text-8xl font-black leading-tight"
                                    initial={!heroAnimationComplete ? { opacity: 0, rotateX: 90 } : { opacity: 1, rotateX: 0 }}
                                    animate={{ opacity: 1, rotateX: 0 }}
                                    transition={!heroAnimationComplete ? { duration: 1.5, delay: 0.5 } : { duration: 0 }}
                                >
                                    <span className="text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">আপনার</span>{' '}
                                    <motion.span
                                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        animate={!heroAnimationComplete ? {
                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                        } : {}}
                                        transition={!heroAnimationComplete ? {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear"
                                        } : {}}
                                        style={{ backgroundSize: "200% 100%" }}
                                    >
                                        গন্তব্যে
                                    </motion.span>{' '}
                                    <span className="text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">পৌঁছান</span>
                                </motion.h1>
                            </TextReveal>

                            <TextReveal delay={0.7} shouldAnimate={!heroAnimationComplete}>
                                <motion.p
                                    className="text-2xl md:text-3xl text-orange-700 leading-relaxed font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    initial={!heroAnimationComplete ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={!heroAnimationComplete ? { duration: 1.2, delay: 0.9 } : { duration: 0 }}
                                >
                                    গন্তব্যের মাধ্যমে রেল টিকিট বুকিং করুন সহজে এবং নিরাপদভাবে।
                                    <br />
                                    <motion.span
                                        className="text-orange-600 font-semibold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        initial={!heroAnimationComplete ? { opacity: 0 } : { opacity: 1 }}
                                        animate={{ opacity: 1 }}
                                        transition={!heroAnimationComplete ? { delay: 1.5 } : { duration: 0 }}
                                    >
                                        সারাদেশে আমাদের বিস্তৃত নেটওয়ার্ক।
                                    </motion.span>
                                </motion.p>
                            </TextReveal>

                            <TextReveal delay={1.1} shouldAnimate={!heroAnimationComplete}>
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                                    <motion.button
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 25px 50px rgba(255,107,53,0.4)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleTicketBooking}
                                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    >
                                        <motion.span
                                            animate={!heroAnimationComplete ? { rotate: [0, 10, -10, 0] } : {}}
                                            transition={!heroAnimationComplete ? { duration: 2, repeat: Infinity } : {}}
                                        >🎫</motion.span>
                                        <span>টিকিট বুক করুন</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 25px 50px rgba(255,107,53,0.4)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/trainInfo')}
                                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    >
                                        <motion.span
                                            animate={!heroAnimationComplete ? { scale: [1, 1.2, 1] } : {}}
                                            transition={!heroAnimationComplete ? { duration: 2, repeat: Infinity } : {}}
                                        >🔍</motion.span>
                                        <span>ট্রেন খুঁজুন</span>
                                    </motion.button>
                                </div>
                            </TextReveal>
                        </div>

                        {/* Enhanced Train Animation */}
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={trainControls}
                            style={{ y: trainY }}
                            className="relative flex justify-center items-center"
                        >
                            <div className="relative">
                                {/* Advanced Smoke Animation - positioned at chimney opening */}
                                <div className="absolute top-[90px] left-[94px] transform -translate-x-1/2">
                                    {[...Array(12)].map((_, i) => (
                                        <SmokeParticle key={i} delay={i * 0.4} duration={6 + i * 0.3} index={i} />
                                    ))}
                                </div>

                                {/* Train with 3D effect */}
                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                        rotateX: [0, 2, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="relative drop-shadow-2xl"
                                >
                                    <motion.svg
                                        width="520"
                                        height="240"
                                        viewBox="0 0 520 240"
                                        className="drop-shadow-2xl"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <defs>
                                            {/* Body gradient */}
                                            <linearGradient id="trainBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#d94a28" />
                                                <stop offset="50%" stopColor="#ff9c6a" />
                                                <stop offset="100%" stopColor="#d94a28" />
                                            </linearGradient>
                                            {/* Wheel gradient */}
                                            <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                                                <stop offset="0%" stopColor="#888" />
                                                <stop offset="100%" stopColor="#222" />
                                            </radialGradient>
                                            {/* Shadow filter */}
                                            <filter id="deepShadow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                                            </filter>
                                        </defs>

                                        {/* Railway Track */}
                                        <rect x="0" y="200" width="520" height="12" fill="#8B4513" rx="6" filter="url(#deepShadow)" />
                                        <rect x="0" y="206" width="520" height="6" fill="#654321" rx="3" />
                                        {[...Array(18)].map((_, i) => (
                                            <rect key={i} x={10 + i * 30} y="208" width="20" height="4" fill="#3E2723" rx="1" />
                                        ))}

                                        {/* Train Body (made much longer) */}
                                        <rect
                                            x="70"
                                            y="120"
                                            width="380"
                                            height="80"
                                            fill="url(#trainBodyGradient)"
                                            rx="18"
                                            filter="url(#deepShadow)"
                                        />
                                        <rect x="80" y="130" width="360" height="60" fill="#FF8C42" rx="12" />

                                        {/* Train Front */}
                                        <path
                                            d="M 70 155 Q 45 155 45 155 Q 45 130 70 120 L 70 200 Q 45 200 45 175 Q 45 155 70 155 Z"
                                            fill="#E55B3C"
                                            filter="url(#deepShadow)"
                                        />

                                        {/* Front Headlight */}
                                        <circle cx="50" cy="165" r="8" fill="#FFF700">
                                            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx="50" cy="165" r="14" fill="rgba(255, 247, 0, 0.3)" />

                                        {/* Windows (many more windows for longer train) */}
                                        {[0, 35, 70, 105, 140, 175, 210, 245, 280, 315].map((offset, i) => (
                                            <g key={i}>
                                                <rect x={100 + offset} y="140" width="28" height="25" fill="#87CEEB" rx="4" />
                                                <rect x={104 + offset} y="145" width="7" height="15" fill="#B0E0E6" rx="2" />
                                            </g>
                                        ))}

                                        {/* Side Vents (more vents along the longer train) */}
                                        <rect x="135" y="158" width="15" height="6" fill="#4B4B4B" />
                                        <rect x="135" y="168" width="15" height="6" fill="#4B4B4B" />
                                        <rect x="235" y="158" width="15" height="6" fill="#4B4B4B" />
                                        <rect x="235" y="168" width="15" height="6" fill="#4B4B4B" />
                                        <rect x="335" y="158" width="15" height="6" fill="#4B4B4B" />
                                        <rect x="335" y="168" width="15" height="6" fill="#4B4B4B" />

                                        {/* Handle */}
                                        <rect x="95" y="160" width="3" height="20" fill="#6E260E" rx="1" />

                                        {/* Chimney with cap */}
                                        <rect x="85" y="95" width="18" height="25" fill="#8B4513" rx="4" filter="url(#deepShadow)" />
                                        <rect x="80" y="90" width="28" height="12" fill="#A0522D" rx="3" />
                                        <ellipse cx="94" cy="90" rx="14" ry="5" fill="#2E2E2E" />

                                        {/* Wheels and connecting rod (properly spaced wheels for longer train) */}
                                        <line x1="110" y1="200" x2="420" y2="200" stroke="#999" strokeWidth="4" />
                                        {[110, 170, 230, 290, 350, 420].map((cx, i) => (
                                            <g key={i}>
                                                <motion.circle
                                                    cx={cx}
                                                    cy="200"
                                                    r="22"
                                                    fill="url(#wheelGradient)"
                                                    filter="url(#deepShadow)"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                                <circle cx={cx} cy="200" r="15" fill="#666" />
                                                <circle cx={cx} cy="200" r="8" fill="#999" />
                                            </g>
                                        ))}

                                        {/* Doors (more doors for longer train) */}
                                        <rect x="280" y="145" width="25" height="40" fill="#8B4513" rx="6" />
                                        <circle cx="298" cy="165" r="3" fill="#FFD700" />
                                        <rect x="320" y="145" width="25" height="40" fill="#8B4513" rx="6" />
                                        <circle cx="338" cy="165" r="3" fill="#FFD700" />
                                        <rect x="380" y="145" width="25" height="40" fill="#8B4513" rx="6" />
                                        <circle cx="398" cy="165" r="3" fill="#FFD700" />
                                        <rect x="420" y="145" width="25" height="40" fill="#8B4513" rx="6" />
                                        <circle cx="438" cy="165" r="3" fill="#FFD700" />

                                        {/* Details */}
                                        <rect x="300" y="150" width="10" height="10" fill="#FFD700" rx="2" />
                                        <rect x="300" y="170" width="10" height="10" fill="#FFD700" rx="2" />
                                        <rect x="400" y="150" width="10" height="10" fill="#FFD700" rx="2" />
                                        <rect x="400" y="170" width="10" height="10" fill="#FFD700" rx="2" />
                                    </motion.svg>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Features Section with Scroll Animations */}
            <section ref={featuresRef} className="relative py-32 px-6 z-20">
                <motion.div
                    style={{ y: useTransform(scrollY, [800, 1600], [50, -50]) }}
                    className="max-w-6xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-orange-800 mb-6 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">আমাদের সেবা</h2>
                        <p className="text-2xl text-orange-600 max-w-3xl mx-auto font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">আধুনিক প্রযুক্তির সাথে নির্ভরযোগ্য রেলওয়ে সেবা</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: "⚡",
                                title: "দ্রুত সেবা",
                                description: "অনলাইনে তাৎক্ষণিক টিকিট বুকিং এবং নিশ্চিতকরণ",
                                color: "from-yellow-400 via-orange-500 to-red-500",
                            },
                            {
                                icon: "🛡️",
                                title: "নিরাপদ পেমেন্ট",
                                description: "আপনার আর্থিক তথ্য সুরক্ষিত এবং এনক্রিপ্টেড",
                                color: "from-green-400 via-blue-500 to-purple-500",
                            },
                            {
                                icon: "🎯",
                                title: "সহজ ব্যবহার",
                                description: "স্বজ্ঞাত ইন্টারফেস এবং সহজ নেভিগেশন",
                                color: "from-purple-400 via-pink-500 to-red-500",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 100, rotateX: -15 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ duration: 1, delay: index * 0.3 }}
                                whileHover={{
                                    y: -15,
                                    scale: 1.02,
                                    rotateX: 5,
                                    boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
                                }}
                                className="bg-white/40 backdrop-blur-xl border border-white/30 p-10 rounded-3xl shadow-2xl transition-all duration-500 text-center group"
                            >
                                <motion.div
                                    className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-4xl shadow-lg`}
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">{feature.title}</h3>
                                <p className="text-lg text-orange-600 leading-relaxed font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Call to Action */}
            <motion.section
                className="relative py-24 px-6 z-20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-12 shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <motion.h2
                            className="text-4xl md:text-5xl font-black text-white mb-6 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                            animate={{
                                y: [0, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            আজই শুরু করুন আপনার যাত্রা!
                        </motion.h2>
                        <motion.p
                            className="text-xl text-white/90 mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            হাজারো গন্তব্যে, লাখো সুবিধা - সব এক জায়গায়
                        </motion.p>
                        <motion.button
                            className="bg-white text-orange-600 px-12 py-4 rounded-full font-bold text-xl shadow-lg font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 20px 40px rgba(255,255,255,0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                        >
                            এখনই সাইন আপ করুন
                        </motion.button>                </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
