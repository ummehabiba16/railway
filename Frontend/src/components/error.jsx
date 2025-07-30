import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";

export default function ErrorPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [trainVisible, setTrainVisible] = useState(false);
    const containerRef = useRef(null);

    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax transforms
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);
    const cloudY = useTransform(scrollY, [0, 1000], [0, -50]);

    // Blue gradient background matching the landing page
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    useEffect(() => {
        const timer = setTimeout(() => setTrainVisible(true), 500);
        return () => clearTimeout(timer);
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

    // Derailed train animation
    const DerailedTrain = () => (
        <motion.div
            initial={{ x: -200, opacity: 0, rotate: 0 }}
            animate={trainVisible ? {
                x: 0,
                opacity: 1,
                rotate: [0, -8, -5, -10, -3]
            } : {}}
            transition={{
                duration: 2,
                ease: "easeOut",
                rotate: {
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                }
            }}
            className="relative pointer-events-none"
        >
            <motion.svg
                width="400"
                height="220"
                viewBox="0 0 400 220"
                className="drop-shadow-2xl pointer-events-none"
                style={{ pointerEvents: 'none' }}
            >
                <defs>
                    {/* Body gradient */}
                    <linearGradient id="errorTrainBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d94a28" />
                        <stop offset="50%" stopColor="#ff6b35" />
                        <stop offset="100%" stopColor="#d94a28" />
                    </linearGradient>
                    {/* Wheel gradient */}
                    <radialGradient id="errorWheelGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#666" />
                        <stop offset="60%" stopColor="#333" />
                        <stop offset="100%" stopColor="#111" />
                    </radialGradient>
                    {/* Rust/damage gradient */}
                    <linearGradient id="rustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B4513" />
                        <stop offset="50%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#654321" />
                    </linearGradient>
                    {/* Shadow filter */}
                    <filter id="errorDeepShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="4" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
                    </filter>
                    {/* Spark filter */}
                    <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Broken Railway Track - More realistic break with missing sections */}
                {/* Left rail section - intact */}
                <rect x="0" y="155" width="110" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" />
                <rect x="0" y="165" width="110" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" />

                {/* Broken middle section - completely missing in places */}
                <rect x="130" y="158" width="30" height="6" fill="#654321" rx="3" opacity="0.6" />
                <rect x="140" y="168" width="25" height="6" fill="#654321" rx="3" opacity="0.6" />

                {/* Twisted/bent rails hanging loose */}
                <path d="M 120 158 Q 130 148 135 163 Q 140 170 145 160" stroke="#8B4513" strokeWidth="5" fill="none" />
                <path d="M 120 168 Q 128 175 138 168 Q 148 165 152 175" stroke="#8B4513" strokeWidth="5" fill="none" />

                {/* Gap with debris */}
                <rect x="170" y="162" width="15" height="4" fill="#8B4513" rx="2" transform="rotate(45 177 164)" />
                <rect x="185" y="170" width="12" height="4" fill="#8B4513" rx="2" transform="rotate(-30 191 172)" />

                {/* Right rail section - severely displaced */}
                <rect x="220" y="172" width="80" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" transform="rotate(12 260 175)" />
                <rect x="220" y="182" width="80" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" transform="rotate(-8 260 185)" />

                {/* Far right section - completely off alignment */}
                <rect x="320" y="185" width="80" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" transform="rotate(25 360 188)" />
                <rect x="320" y="195" width="80" height="6" fill="url(#rustGradient)" rx="3" filter="url(#errorDeepShadow)" transform="rotate(-15 360 198)" />

                {/* Railway ties/sleepers - scattered and broken */}
                <rect x="20" y="150" width="35" height="8" fill="#654321" rx="2" />
                <rect x="65" y="150" width="35" height="8" fill="#654321" rx="2" />
                {/* Broken ties */}
                <rect x="110" y="155" width="15" height="8" fill="#654321" rx="2" transform="rotate(35 117 159)" />
                <rect x="125" y="150" width="20" height="8" fill="#654321" rx="2" transform="rotate(-45 135 154)" />
                <rect x="150" y="165" width="25" height="8" fill="#654321" rx="2" transform="rotate(60 162 169)" />
                <rect x="180" y="160" width="30" height="8" fill="#654321" rx="2" transform="rotate(-20 195 164)" />
                <rect x="240" y="170" width="35" height="8" fill="#654321" rx="2" transform="rotate(15 257 174)" />
                <rect x="290" y="180" width="35" height="8" fill="#654321" rx="2" transform="rotate(-10 307 184)" />
                <rect x="340" y="190" width="35" height="8" fill="#654321" rx="2" transform="rotate(30 357 194)" />

                {/* Splintered wood debris */}
                <path d="M 160 175 L 165 180 L 170 175 L 175 180" stroke="#654321" strokeWidth="3" fill="none" />
                <path d="M 200 185 L 205 190 L 210 185" stroke="#654321" strokeWidth="3" fill="none" />

                {/* Bolts and metal debris scattered */}
                <circle cx="135" cy="170" r="2" fill="#666" />
                <circle cx="190" cy="175" r="2" fill="#666" />
                <circle cx="210" cy="180" r="2" fill="#666" />
                <rect x="175" y="178" width="4" height="4" fill="#555" rx="1" transform="rotate(45 177 180)" />
                <rect x="225" y="185" width="3" height="3" fill="#555" rx="1" transform="rotate(-30 226 186)" />

                {/* Train Body - more realistic with damage */}
                <rect
                    x="60"
                    y="90"
                    width="200"
                    height="65"
                    fill="url(#errorTrainBodyGradient)"
                    rx="12"
                    filter="url(#errorDeepShadow)"
                    transform="rotate(-8 160 122)"
                />

                {/* Train roof */}
                <rect
                    x="65"
                    y="85"
                    width="190"
                    height="12"
                    fill="#B8860B"
                    rx="6"
                    transform="rotate(-8 160 91)"
                />

                {/* Train Front - more detailed */}
                <path
                    d="M 60 122 Q 35 122 35 122 Q 35 95 60 90 L 60 155 Q 35 155 35 140 Q 35 122 60 122 Z"
                    fill="#E55B3C"
                    filter="url(#errorDeepShadow)"
                    transform="rotate(-8 47 122)"
                />

                {/* Coupling/buffer */}
                <rect x="30" y="120" width="8" height="8" fill="#333" rx="2" transform="rotate(-8 34 124)" />

                {/* Broken Headlight with glass shards */}
                <circle cx="42" cy="125" r="8" fill="#222" transform="rotate(-8 42 125)" />
                <circle cx="42" cy="125" r="6" fill="#666" transform="rotate(-8 42 125)" />
                <path d="M 38 121 L 46 129 M 46 121 L 38 129" stroke="#333" strokeWidth="2" transform="rotate(-8 42 125)" />

                {/* Realistic Windows with detailed cracks */}
                <rect x="85" y="100" width="25" height="20" fill="#87CEEB" rx="3" transform="rotate(-8 97 110)" />
                <rect x="120" y="100" width="25" height="20" fill="#87CEEB" rx="3" transform="rotate(-8 132 110)" />
                <rect x="155" y="100" width="25" height="20" fill="#87CEEB" rx="3" transform="rotate(-8 167 110)" />
                <rect x="190" y="100" width="25" height="20" fill="#87CEEB" rx="3" transform="rotate(-8 202 110)" />

                {/* Detailed crack patterns */}
                <path d="M 90 105 L 100 115 L 95 120 M 95 105 L 105 115" stroke="#666" strokeWidth="1.5" transform="rotate(-8 97 110)" />
                <path d="M 160 105 L 170 115 L 165 120 M 165 105 L 175 115" stroke="#666" strokeWidth="1.5" transform="rotate(-8 167 110)" />
                <path d="M 195 105 L 205 115 L 200 120" stroke="#666" strokeWidth="1.5" transform="rotate(-8 202 110)" />

                {/* Door */}
                <rect x="140" y="125" width="20" height="30" fill="#C0392B" rx="2" transform="rotate(-8 150 140)" />
                <circle cx="155" cy="140" r="1.5" fill="#FFD700" transform="rotate(-8 155 140)" />

                {/* Falling/Derailed Wheels - completely off track, falling down */}
                <motion.g
                    animate={{
                        x: [0, -8, -15, -25],
                        y: [0, 5, 15, 30],
                        rotate: [0, 45, 90, 180]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse"
                    }}
                >
                    <circle cx="85" cy="175" r="18" fill="url(#errorWheelGradient)" filter="url(#errorDeepShadow)" />
                    <circle cx="85" cy="175" r="12" fill="#444" />
                    <circle cx="85" cy="175" r="8" fill="#666" />
                    <circle cx="85" cy="175" r="3" fill="#888" />
                    {/* Wheel spokes */}
                    <line x1="85" y1="157" x2="85" y2="193" stroke="#222" strokeWidth="3" />
                    <line x1="67" y1="175" x2="103" y2="175" stroke="#222" strokeWidth="3" />
                    <line x1="74" y1="164" x2="96" y2="186" stroke="#222" strokeWidth="2" />
                    <line x1="96" y1="164" x2="74" y2="186" stroke="#222" strokeWidth="2" />
                    {/* Wheel rim details */}
                    <circle cx="85" cy="175" r="16" fill="none" stroke="#333" strokeWidth="2" />
                </motion.g>

                <motion.g
                    animate={{
                        x: [0, 10, 20, 35],
                        y: [0, 8, 20, 40],
                        rotate: [0, -60, -120, -240]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse",
                        delay: 1
                    }}
                >
                    <circle cx="180" cy="175" r="18" fill="url(#errorWheelGradient)" filter="url(#errorDeepShadow)" />
                    <circle cx="180" cy="175" r="12" fill="#444" />
                    <circle cx="180" cy="175" r="8" fill="#666" />
                    <circle cx="180" cy="175" r="3" fill="#888" />
                    {/* Wheel spokes */}
                    <line x1="180" y1="157" x2="180" y2="193" stroke="#222" strokeWidth="3" />
                    <line x1="162" y1="175" x2="198" y2="175" stroke="#222" strokeWidth="3" />
                    <line x1="169" y1="164" x2="191" y2="186" stroke="#222" strokeWidth="2" />
                    <line x1="191" y1="164" x2="169" y2="186" stroke="#222" strokeWidth="2" />
                    {/* Wheel rim details */}
                    <circle cx="180" cy="175" r="16" fill="none" stroke="#333" strokeWidth="2" />
                </motion.g>

                {/* Third wheel - bouncing off track */}
                <motion.g
                    animate={{
                        x: [0, -5, 8, -12],
                        y: [0, 3, -5, 25],
                        rotate: [0, 90, 180, 360]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse",
                        delay: 2
                    }}
                >
                    <circle cx="260" cy="185" r="16" fill="url(#errorWheelGradient)" filter="url(#errorDeepShadow)" />
                    <circle cx="260" cy="185" r="10" fill="#444" />
                    <circle cx="260" cy="185" r="6" fill="#666" />
                    <circle cx="260" cy="185" r="3" fill="#888" />
                    {/* Wheel spokes */}
                    <line x1="260" y1="169" x2="260" y2="201" stroke="#222" strokeWidth="1.5" />
                    <line x1="244" y1="185" x2="276" y2="185" stroke="#222" strokeWidth="1.5" />
                    <line x1="251" y1="174" x2="269" y2="196" stroke="#222" strokeWidth="1.5" />
                    <line x1="269" y1="174" x2="251" y2="196" stroke="#222" strokeWidth="1.5" />
                    {/* Wheel rim details */}
                    <circle cx="260" cy="185" r="14" fill="none" stroke="#333" strokeWidth="1.5" />
                </motion.g>

                {/* Sparks from wheels scraping against broken track */}
                <motion.g>
                    <motion.circle
                        cx="95"
                        cy="185"
                        r="1"
                        fill="#FFD700"
                        filter="url(#sparkGlow)"
                        animate={{
                            opacity: [0, 1, 0.5, 1, 0],
                            scale: [0.5, 1.5, 0.8, 2, 0],
                            x: [0, 2, -1, 3, 0],
                            y: [0, -2, 1, -3, 0]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                    <motion.circle
                        cx="190"
                        cy="185"
                        r="1.5"
                        fill="#FF6347"
                        filter="url(#sparkGlow)"
                        animate={{
                            opacity: [0, 1, 0.3, 1, 0],
                            scale: [0.3, 1.8, 0.6, 2.2, 0],
                            x: [0, -2, 1, -3, 0],
                            y: [0, 2, -1, 3, 0]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.3
                        }}
                    />
                    <motion.circle
                        cx="270"
                        cy="195"
                        r="1"
                        fill="#FFA500"
                        filter="url(#sparkGlow)"
                        animate={{
                            opacity: [0, 1, 0.4, 1, 0],
                            scale: [0.4, 1.2, 0.7, 1.8, 0],
                            x: [0, 1, -2, 2, 0],
                            y: [0, -1, 2, -2, 0]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.6
                        }}
                    />
                </motion.g>

                {/* Metal fragments and debris flying off */}
                <motion.rect
                    x="120"
                    y="180"
                    width="3"
                    height="6"
                    fill="#8B4513"
                    rx="1"
                    animate={{
                        x: [0, -8, -15, -25],
                        y: [0, -5, -10, -20],
                        rotate: [0, 45, 90, 180]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                />
                <motion.rect
                    x="200"
                    y="185"
                    width="4"
                    height="4"
                    fill="#666"
                    rx="1"
                    animate={{
                        x: [0, 10, 20, 30],
                        y: [0, -3, -8, -15],
                        rotate: [0, -30, -60, -120]
                    }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 1
                    }}
                />
                <motion.circle
                    cx="240"
                    cy="190"
                    r="2"
                    fill="#654321"
                    animate={{
                        x: [0, -5, -10, -18],
                        y: [0, 2, 5, 12],
                        scale: [1, 0.8, 0.6, 0.4]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 1.5
                    }}
                />

                {/* Enhanced Smoke/Steam from damage with fire and explosion effects */}
                <motion.g>
                    <motion.circle
                        cx="140"
                        cy="80"
                        r="4"
                        fill="#666"
                        opacity="0.7"
                        animate={{
                            y: [0, -25, -50, -75],
                            x: [0, 5, -3, 8],
                            scale: [0.5, 1.2, 1.8, 0],
                            opacity: [0.7, 0.4, 0.1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                    <motion.circle
                        cx="170"
                        cy="85"
                        r="5"
                        fill="#888"
                        opacity="0.6"
                        animate={{
                            y: [0, -30, -60, -90],
                            x: [0, -5, 3, -8],
                            scale: [0.3, 1.5, 2.2, 0],
                            opacity: [0.6, 0.3, 0.1, 0]
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.8
                        }}
                    />
                    <motion.circle
                        cx="200"
                        cy="82"
                        r="3"
                        fill="#555"
                        opacity="0.5"
                        animate={{
                            y: [0, -20, -40, -60],
                            x: [0, 3, -2, 5],
                            scale: [0.4, 1, 1.5, 0],
                            opacity: [0.5, 0.3, 0.1, 0]
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 1.2
                        }}
                    />

                    {/* Fire and explosion effects */}
                    <motion.circle
                        cx="100"
                        cy="75"
                        r="3"
                        fill="#FF4500"
                        opacity="0.8"
                        animate={{
                            y: [0, -15, -30],
                            scale: [0.3, 1.5, 0],
                            opacity: [0.8, 0.4, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.2
                        }}
                    />
                    <motion.circle
                        cx="180"
                        cy="80"
                        r="2"
                        fill="#FFD700"
                        opacity="0.9"
                        animate={{
                            y: [0, -10, -20],
                            scale: [0.2, 1.2, 0],
                            opacity: [0.9, 0.5, 0]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.8
                        }}
                    />
                </motion.g>

                {/* Steam vents from damaged engine */}
                <motion.g>
                    <motion.ellipse
                        cx="90"
                        cy="85"
                        rx="3"
                        ry="6"
                        fill="#FFF"
                        opacity="0.6"
                        animate={{
                            y: [0, -20, -40],
                            scaleY: [1, 1.5, 0],
                            opacity: [0.6, 0.3, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                    <motion.ellipse
                        cx="210"
                        cy="90"
                        rx="4"
                        ry="8"
                        fill="#FFF"
                        opacity="0.5"
                        animate={{
                            y: [0, -25, -50],
                            scaleY: [1, 1.8, 0],
                            opacity: [0.5, 0.2, 0]
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 1
                        }}
                    />
                </motion.g>

                {/* Oil spills and fluid leaks */}
                <motion.ellipse
                    cx="130"
                    cy="160"
                    rx="8"
                    ry="3"
                    fill="#1a1a1a"
                    opacity="0.7"
                    animate={{
                        scaleX: [1, 1.5, 2],
                        opacity: [0.7, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                />
                <motion.ellipse
                    cx="220"
                    cy="175"
                    rx="10"
                    ry="4"
                    fill="#2a2a2a"
                    opacity="0.6"
                    animate={{
                        scaleX: [1, 1.8, 2.5],
                        opacity: [0.6, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 1
                    }}
                />

                {/* Emergency lights flashing */}
                <motion.circle
                    cx="45"
                    cy="95"
                    r="3"
                    fill="#FF0000"
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.circle
                    cx="225"
                    cy="95"
                    r="3"
                    fill="#FF0000"
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                />
            </motion.svg>
        </motion.div>
    );

    return (
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
                        background: `radial-gradient(circle, rgba(255,0,0,0.15) 0%, rgba(255,69,0,0.08) 70%, transparent 100%)`,
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
                <Cloud className="top-28 left-1/2" delay={3.5} scale={1.1} />
            </motion.div>

            {/* Error Content */}
            <main className="relative min-h-screen flex items-center justify-center px-6 pt-20 z-30">
                <div className="max-w-6xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Error Text */}
                        <div className="space-y-10 relative z-40">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="space-y-6"
                            >
                                <motion.h1
                                    className="text-8xl md:text-9xl font-black text-orange-600"
                                    animate={{
                                        textShadow: [
                                            "0 0 0px rgba(255,107,53,0)",
                                            "0 0 20px rgba(255,107,53,0.5)",
                                            "0 0 0px rgba(255,107,53,0)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    404
                                </motion.h1>

                                <motion.h2
                                    className="text-4xl md:text-6xl font-black text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                >
                                    ট্রেন লাইনচ্যুত!
                                </motion.h2>

                                <motion.p
                                    className="text-xl md:text-2xl text-orange-700 leading-relaxed font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                >
                                    দুঃখিত! আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি পাওয়া যাচ্ছে না।
                                    <br />
                                    <span className="text-orange-600 font-semibold">
                                        আমাদের ট্রেন ভুল রুটে চলে গেছে!
                                    </span>
                                </motion.p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
                            >
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 25px 50px rgba(255,107,53,0.4)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    onClick={() => window.history.back()}
                                >
                                    <motion.span
                                        animate={{ x: [-5, 0, -5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >←</motion.span>
                                    <span>পূর্ববর্তী পৃষ্ঠা</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 25px 50px rgba(255,107,53,0.4)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-blue-300 transition-all duration-300 flex items-center justify-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <motion.span
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    >🏠</motion.span>
                                    <span>হোম</span>
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Derailed Train Animation */}
                        <motion.div
                            className="relative flex justify-center items-center pointer-events-none"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                            style={{ pointerEvents: 'none' }}
                        >
                            <DerailedTrain />
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Error Stats Section */}
            <motion.section
                className="relative py-20 px-6 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-10 shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <motion.h3
                            className="text-2xl md:text-3xl font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                            animate={{
                                y: [0, -3, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            কী করতে পারেন?
                        </motion.h3>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            {[
                                { icon: "🔍", title: "URL পরীক্ষা করুন", desc: "টাইপো আছে কিনা দেখুন" },
                                { icon: "🔄", title: "পৃষ্ঠা রিফ্রেশ করুন", desc: "আবার চেষ্টা করুন" },
                                { icon: "📞", title: "সহায়তা নিন", desc: "আমাদের সাথে যোগাযোগ করুন" }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5 + index * 0.2 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="text-3xl mb-2">{item.icon}</div>
                                    <h4 className="font-bold text-orange-800 mb-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-orange-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
