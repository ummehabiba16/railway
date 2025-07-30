import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./navBar";

function SearchTrainForm() {
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

    // Blue gradient background matching the landing page theme
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    const [coachWiseTicketResponse, setCoachWiseTicketResponse] = useState(null);
    const [bookingResponse, setBookingResponse] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [currCoach, setCurrCoach] = useState(null);
    const [showBanPopup, setShowBanPopup] = useState(false);
    const [bannedUntil, setBannedUntil] = useState(null);
    const [banTimeRemaining, setBanTimeRemaining] = useState("");
    const [seatSelectionError, setSeatSelectionError] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const [fromStations, setFromStations] = useState([]);
    const [toStations, setToStations] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [classes, setClasses] = useState([]);
    const [responseData, setResponseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchData, setSearchData] = useState({
        fromStation: "",
        toStation: "",
        date: null,
        class_: "",
    });

    // Mouse position tracking
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
                const [fromRes, toRes, dateRes, classRes] = await Promise.all([
                    api.get("/public/stations/from"),
                    api.get("/public/stations/to"),
                    api.get("/public/date"),
                    api.get("/public/classes"),
                ]);

                setFromStations(fromRes.data);
                setToStations(toRes.data);
                setAvailableDates(dateRes.data.map((d) => new Date(d)));
                setClasses(classRes.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError("ডেটা লোড করতে সমস্যা হয়েছে।");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const checkBannedStatus = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (userId) {
                const response = await api.get(`/user/banned/${userId}`);
                const banStatus = response.data.status;
                const bannedTime = response.data.bannedUntil;

                console.log("Ban status response:", response.data);

                // Check if user is banned using the status field
                if (banStatus === "BANNED") {
                    // User is banned - bannedTime contains the remaining time in MM:SS format
                    setBannedUntil(bannedTime);
                    setShowBanPopup(true);
                    return true; // User is banned
                } else {
                    // User is not banned
                    setBannedUntil(null);
                    setShowBanPopup(false);
                    setBanTimeRemaining("");
                    return false; // User is not banned
                }
            } else {
                // No user ID
                setBannedUntil(null);
                setShowBanPopup(false);
                setBanTimeRemaining("");
                return false; // User is not banned
            }
            return false; // No user ID or not banned
        } catch (err) {
            console.error("Error checking banned status:", err);
            return false;
        }
    };

    // Ban timer effect - bannedUntil is now in MM:SS format
    useEffect(() => {
        if (!bannedUntil || !showBanPopup || bannedUntil === "NOT_BANNED") return;

        // bannedUntil is already in MM:SS format from the backend
        setBanTimeRemaining(bannedUntil);

        // Set up a countdown timer that decreases the time every second
        const updateBanTimer = () => {
            // Parse the current time remaining (MM:SS format)
            const timeString = banTimeRemaining || bannedUntil;

            // Skip if it's "NOT_BANNED"
            if (timeString === "NOT_BANNED") {
                setBanTimeRemaining("");
                setShowBanPopup(false);
                setBannedUntil(null);
                return;
            }

            // Check if the format is valid MM:SS
            if (!timeString || !timeString.includes(':')) {
                console.error("Invalid time format:", timeString);
                setBanTimeRemaining("00:00");
                return;
            }

            const [minutes, seconds] = timeString.split(':').map(Number);

            // Check if parsing was successful
            if (isNaN(minutes) || isNaN(seconds)) {
                console.error("Failed to parse time:", timeString);
                setBanTimeRemaining("00:00");
                return;
            }

            let totalSeconds = minutes * 60 + seconds;

            totalSeconds -= 1;

            if (totalSeconds <= 0) {
                setBanTimeRemaining("UNBAN_READY");
                // Auto-close popup after 2 seconds when ban expires
                setTimeout(() => {
                    setShowBanPopup(false);
                    setBannedUntil(null);
                    setBanTimeRemaining("");
                }, 2000);
                return;
            }

            const newMinutes = Math.floor(totalSeconds / 60);
            const newSeconds = totalSeconds % 60;
            const newTimeString = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;

            setBanTimeRemaining(newTimeString);
            setBannedUntil(newTimeString); // Update the bannedUntil state as well
        };

        // Start the countdown after 1 second
        const banInterval = setInterval(updateBanTimer, 1000);

        return () => clearInterval(banInterval);
    }, [bannedUntil, showBanPopup, banTimeRemaining]);

    const handleDateChange = (d) => {
        setSearchData((prev) => ({ ...prev, date: d }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedDate = searchData.date
                ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
                : null;

            const formattedSearchData = {
                ...searchData,
                date: formattedDate,
            };

            const res = await api.post("/public/search", formattedSearchData);
            setResponseData(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("Search error:", err);
            setError("অনুসন্ধান ব্যর্থ হয়েছে।");
        }
    };

    const handleBookNow = async (trainId, classId) => {
        // Check if user is banned first
        const isBanned = await checkBannedStatus();
        if (isBanned) {
            console.log("User is banned, stopping booking process");
            return; // Stop execution if user is banned, popup will be shown
        }

        console.log("User is not banned, proceeding with booking");

        try {
            const formattedDate = searchData.date
                ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
                : null;

            if (!formattedDate) {
                setError("বুকিং এর আগে একটি বৈধ তারিখ নির্বাচন করুন।");
                return;
            }

            console.log(
                `Booking: trainId=${trainId}, classId=${classId}, date=${formattedDate}`
            );

            const response = await api.get("/book", {
                params: {
                    trainId: trainId,
                    classId: classId,
                    date: formattedDate,
                    fromStation: searchData.fromStation,
                    toStation: searchData.toStation,
                },
            });

            const enhancedBookingResponse = response.data.map((coach) => ({
                ...coach,
                trainId: trainId,
                classId: classId,
                date: formattedDate,
            }));

            setBookingResponse(enhancedBookingResponse);
            setCoachWiseTicketResponse(null);
            setSelectedSeats([]);
            console.log("Booking response:", enhancedBookingResponse);
        } catch (err) {
            console.error("Booking failed:", err);
            if (err.response && err.response.status === 401) {
                setError("চালিয়ে যেতে অনুগ্রহ করে লগইন করুন।");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError("বুকিং ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            }
        }
    };

    const handleCoachSelection = async (coachId) => {
        try {
            const formattedDate = searchData.date
                ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
                : null;

            if (!formattedDate) {
                setError("এগিয়ে যাওয়ার আগে একটি বৈধ তারিখ নির্বাচন করুন।");
                return;
            }
            setCurrCoach(coachId);
            setCoachWiseTicketResponse(null);

            const selectedCoach = bookingResponse.find(
                (coach) => coach.coachId === coachId
            );

            console.log(`Coach selected: coachId=${coachId}, date=${formattedDate}`);
            console.log("Selected coach details:", selectedCoach);

            const requestData = {
                trainId: selectedCoach.trainId || "",
                classId: selectedCoach.classId || "",
                date: formattedDate,
                coachId: coachId,
                fromStation: searchData.fromStation,
                toStation: searchData.toStation,
            };

            const response = await api.post("/book/coach", requestData);

            const enhancedCoachResponse = {
                trainId: selectedCoach.trainId,
                coachId: coachId,
                classId: selectedCoach.classId,
                date: formattedDate,
                seatCount: selectedCoach.seatCount,
                tickets: response.data,
            };

            setCoachWiseTicketResponse(enhancedCoachResponse);
            setSelectedSeats([]);
            console.log("Coach selection response:", enhancedCoachResponse);
        } catch (err) {
            console.error("Coach selection failed:", err);
            if (err.response && err.response.status === 401) {
                navigate("/login");
            } else {
                setError("কোচ নির্বাচন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            }
        }
    };

    const handleBookSelectedSeats = async () => {
        if (selectedSeats.length === 0) {
            setSeatSelectionError("অন্তত একটি আসন বেছে নিন।");
            return;
        }

        // Check if user is banned before proceeding with booking
        const isBanned = await checkBannedStatus();
        if (isBanned) {
            console.log("User is banned, cannot complete booking");
            return; // Stop execution if user is banned, popup will be shown
        }

        try {
            const userId = localStorage.getItem("userId");
            const formattedDate = searchData.date
                ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
                : null;

            // Step 1: Create booking
            const createBookingResponse = await api.post("/booking/create", {
                userId,
                travelDate: formattedDate,
                ticketIds: selectedSeats,
            });

            const bookingId = createBookingResponse.data;

            // Step 2: Navigate to the booking details page
            navigate(`/booking/${bookingId}`);

            setSelectedSeats([]);
            setSeatSelectionError("");
        } catch (err) {
            console.error("Seat booking failed:", err);
            if (err.response && err.response.status === 401) {
                setError("লগইন করতে হবে।");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setSeatSelectionError("আসন বুকিং ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            }
        }
    };

    const handleSeatSelection = async (ticket) => {
        if (ticket.ticketStatus !== "AVAILABLE") {
            setSeatSelectionError("এই আসন বুক করা যাবে না।");
            return;
        }

        // Check if user is banned before allowing seat selection
        const isBanned = await checkBannedStatus();
        if (isBanned) {
            console.log("User is banned, cannot select seat");
            return; // Stop execution if user is banned, popup will be shown
        }

        // Check if seat is already selected
        if (selectedSeats.includes(ticket.ticketId)) {
            // Remove from selection
            setSelectedSeats((prev) => prev.filter((id) => id !== ticket.ticketId));
            setSeatSelectionError(""); // Clear error when deselecting
            return;
        }

        // Check if maximum seats selected
        if (selectedSeats.length >= 4) {
            setSeatSelectionError("সর্বোচ্চ ৪টি আসন বেছে নিতে পারবেন।");
            return;
        }

        try {
            // Make POST request to check seat availability
            const response = await api.post("/book/seat/select", {
                ticketId: ticket.ticketId
            });

            // Get the status from response
            const status = response.data; // This should be the status string

            if (status === "AVAILABLE") {
                // Add to selection if available
                setSelectedSeats((prev) => [...prev, ticket.ticketId]);
                setSeatSelectionError(""); // Clear any previous errors
            } else {
                // Update the ticket status in local state with the received status
                setCoachWiseTicketResponse(prev => ({
                    ...prev,
                    tickets: prev.tickets.map(t =>
                        t.ticketId === ticket.ticketId
                            ? { ...t, ticketStatus: status }
                            : t
                    )
                }));

                // Show appropriate error message based on status
                let errorMessage = "এই আসন পাওয়া যাচ্ছে না।";
                if (status === "BOOKED") {
                    errorMessage = "এই আসন আগেই বুক হয়ে গেছে।";
                } else if (status === "IN PROGRESS") {
                    errorMessage = "এই আসন এখন অন্য কেউ বুক করছে।";
                }

                setSeatSelectionError(errorMessage);
            }
        } catch (err) {
            console.error("Seat selection failed:", err);

            // Handle HTTP errors
            if (err.response) {
                if (err.response.status === 404) {
                    setSeatSelectionError("আসনের তথ্য পাওয়া যায় নি।");
                } else if (err.response.status === 500) {
                    setSeatSelectionError("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
                } else {
                    setSeatSelectionError("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
                }
            } else {
                setSeatSelectionError("ইন্টারনেট সংযোগ দেখুন।");
            }
        }
    };

    const getSeatColor = (ticket) => {
        if (selectedSeats.includes(ticket.ticketId)) {
            return "bg-success";
        }

        switch (ticket.ticketStatus) {
            case "AVAILABLE":
                return "bg-light border-success";
            case "IN PROGRESS":
                return "bg-warning";
            case "BOOKED":
                return "bg-danger";
            default:
                return "bg-secondary";
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
            <>
                <Navbar />
                <div ref={containerRef} className="relative overflow-hidden min-h-screen">
                    <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />
                    <main className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-12 z-30">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <motion.div
                                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <h2 className="text-2xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                লোড হচ্ছে...
                            </h2>
                        </motion.div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            {/* Ban Popup Modal */}
            {showBanPopup && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white/95 backdrop-blur-xl border border-red-300 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
                    >
                        <div className="text-center">
                            <motion.div
                                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="text-4xl">🚫</span>
                            </motion.div>

                            <h3 className="text-2xl font-bold text-red-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                বুকিং বন্ধ
                            </h3>

                            <p className="text-gray-700 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                আপনি ৫ মিনিটের জন্য বুকিং করতে পারবেন না।
                            </p>                            {banTimeRemaining && banTimeRemaining !== "UNBAN_READY" && (
                                <motion.div
                                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
                                    animate={{ boxShadow: ["0 0 0 rgba(239,68,68,0.3)", "0 0 20px rgba(239,68,68,0.3)", "0 0 0 rgba(239,68,68,0.3)"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <p className="text-sm text-red-700 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        বাকি সময়:
                                    </p>
                                    <div className="text-2xl font-bold text-red-800 font-mono">
                                        {banTimeRemaining}
                                    </div>
                                </motion.div>
                            )}

                            {banTimeRemaining === "UNBAN_READY" && (
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4"
                                >
                                    <div className="flex items-center justify-center">
                                        <span className="text-2xl mr-2">✅</span>
                                        <span className="text-green-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            এখন আবার বুকিং করতে পারবেন!
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex gap-3 justify-center">
                                <motion.button
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    onClick={() => setShowBanPopup(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    বন্ধ করুন
                                </motion.button>

                                {banTimeRemaining === "UNBAN_READY" && (
                                    <motion.button
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        onClick={() => {
                                            setShowBanPopup(false);
                                            setBannedUntil(null);
                                            setBanTimeRemaining("");
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        আবার চেষ্টা করুন
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <div ref={containerRef} className="relative overflow-hidden min-h-screen">
                <motion.div style={{ backgroundColor: 'rgb(230,249,255)' }} className="fixed inset-0 z-0" />

                {/* Ambient Elements */}
                <div className="fixed inset-0 pointer-events-none z-1">
                    {/* Floating Particles */}
                    {[...Array(20)].map((_, i) => (
                        <FloatingParticle key={i} delay={i * 1.5} size={Math.random() > 0.5 ? 1 : 2} />
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

                {/* Main Content */}
                <main className="relative min-h-screen px-6 pt-32 pb-12 z-30">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-12"
                        >
                            <motion.h1
                                className="text-5xl font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
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
                                ট্রেন খুঁজুন
                            </motion.h1>
                            <motion.p
                                className="text-xl text-orange-600 max-w-2xl mx-auto font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                আপনার পছন্দের ট্রেন খুঁজে টিকিট বুক করুন
                            </motion.p>
                        </motion.div>

                        {/* Search Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl mb-8"
                        >
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* From Station */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        কোথা থেকে *
                                    </label>
                                    <motion.select
                                        name="fromStation"
                                        value={searchData.fromStation}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                        }}
                                    >
                                        <option value="">স্টেশন নির্বাচন করুন</option>
                                        {fromStations.map((st) => (
                                            <option key={st.stationId} value={st.stationId}>
                                                {st.name}
                                            </option>
                                        ))}
                                    </motion.select>
                                </motion.div>

                                {/* To Station */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        কোথায় যাবেন *
                                    </label>
                                    <motion.select
                                        name="toStation"
                                        value={searchData.toStation}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                        }}
                                    >
                                        <option value="">স্টেশন নির্বাচন করুন</option>
                                        {toStations.map((st) => (
                                            <option key={st.stationId} value={st.stationId}>
                                                {st.name}
                                            </option>
                                        ))}
                                    </motion.select>
                                </motion.div>

                                {/* Journey Date */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        যাত্রার তারিখ *
                                    </label>
                                    <motion.div
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                        }}
                                    >
                                        <DatePicker
                                            selected={searchData.date}
                                            onChange={handleDateChange}
                                            includeDates={availableDates}
                                            placeholderText="তারিখ বেছে নিন"
                                            className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900"
                                            dateFormat="dd-MM-yyyy"
                                            required
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Class */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                >
                                    <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        শ্রেণী *
                                    </label>
                                    <motion.select
                                        name="class_"
                                        value={searchData.class_}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-orange-900"
                                        whileFocus={{
                                            scale: 1.02,
                                            boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                        }}
                                    >
                                        <option value="">শ্রেণী নির্বাচন করুন</option>
                                        {classes.map((c) => (
                                            <option key={c.classId} value={c.classId}>
                                                {c.className}
                                            </option>
                                        ))}
                                    </motion.select>
                                </motion.div>

                                {/* Search Button */}
                                <motion.div
                                    className="lg:col-span-4 flex justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    <motion.button
                                        type="submit"
                                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center space-x-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 25px 50px rgba(255,102,0,0.4)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            🔍
                                        </motion.span>
                                        <span>ট্রেন খুঁজুন</span>
                                    </motion.button>
                                </motion.div>
                            </form>
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-100/80 border border-red-300 text-red-700 px-6 py-4 rounded-xl backdrop-blur-sm mb-6"
                            >
                                <div className="flex items-center">
                                    <span className="mr-3">⚠️</span>
                                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        {error}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* Search Results */}
                        {responseData && responseData.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.h2
                                    className="text-3xl font-bold text-orange-800 mb-6 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    উপলব্ধ ট্রেন সমূহ
                                </motion.h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {responseData.map((train, index) => (
                                        <motion.div
                                            key={train.trainId}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl"
                                            whileHover={{
                                                scale: 1.02,
                                                boxShadow: "0 25px 50px rgba(255,102,0,0.2)"
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <motion.h3
                                                    className="text-xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                    animate={{
                                                        textShadow: [
                                                            "0 0 0px rgba(255,102,0,0)",
                                                            "0 0 5px rgba(255,102,0,0.3)",
                                                            "0 0 0px rgba(255,102,0,0)"
                                                        ]
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    {train.trainName}
                                                </motion.h3>
                                                <motion.span
                                                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {train.trainId}
                                                </motion.span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                        <strong>ছেড়ে যাবে:</strong> {train.departureTime}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                        <strong>পৌঁছাবে:</strong> {train.arrivalTime}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Classes */}
                                            <div className="space-y-3">
                                                {train.classes.map((cls, classIndex) => (
                                                    <motion.div
                                                        key={classIndex}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: classIndex * 0.1 }}
                                                        className="bg-white/30 border border-white/50 rounded-xl p-4"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>শ্রেণী:</strong> {cls.className}
                                                                </p>
                                                                <p className="text-sm text-green-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>ভাড়া:</strong> {cls.fare} টাকা
                                                                </p>
                                                                <p className="text-sm text-purple-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>উপলব্ধ আসন:</strong> {cls.availableCount}
                                                                </p>
                                                            </div>
                                                            <motion.button
                                                                onClick={() => handleBookNow(train.trainId, cls.classId)}
                                                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-orange-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                                whileHover={{
                                                                    scale: 1.05,
                                                                    boxShadow: "0 15px 30px rgba(255,102,0,0.4)"
                                                                }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <motion.span
                                                                    animate={{ x: [0, 2, 0] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                >
                                                                    🎫
                                                                </motion.span>
                                                                <span className="ml-2">এখনই বুক করুন</span>
                                                            </motion.button>
                                                        </div>

                                                        {/* Show coaches for this specific train and class */}
                                                        {bookingResponse &&
                                                            bookingResponse.length > 0 &&
                                                            bookingResponse[0].trainId === train.trainId &&
                                                            bookingResponse[0].classId === cls.classId && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    transition={{ duration: 0.5 }}
                                                                    className="mt-4 pt-4 border-t border-white/30"
                                                                >
                                                                    <h4 className="text-lg font-bold text-orange-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                        উপলব্ধ কোচ সমূহ:
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        {bookingResponse.map((coach, coachIndex) => (
                                                                            <motion.div
                                                                                key={coachIndex}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ duration: 0.3, delay: coachIndex * 0.1 }}
                                                                                className="bg-white/40 border border-white/60 rounded-xl p-3 cursor-pointer hover:bg-white/60 transition-all duration-300"
                                                                                onClick={() => handleCoachSelection(coach.coachId)}
                                                                                whileHover={{
                                                                                    scale: 1.03,
                                                                                    boxShadow: "0 10px 20px rgba(255,102,0,0.3)"
                                                                                }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                            >
                                                                                <div className="text-center">
                                                                                    <motion.h5
                                                                                        className="font-bold text-orange-800 mb-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                                                        animate={{
                                                                                            textShadow: [
                                                                                                "0 0 0px rgba(255,102,0,0)",
                                                                                                "0 0 5px rgba(255,102,0,0.3)",
                                                                                                "0 0 0px rgba(255,102,0,0)"
                                                                                            ]
                                                                                        }}
                                                                                        transition={{
                                                                                            duration: 3,
                                                                                            repeat: Infinity,
                                                                                            ease: "easeInOut"
                                                                                        }}
                                                                                    >
                                                                                        {coach.coachName}
                                                                                    </motion.h5>
                                                                                    <motion.span
                                                                                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                                                        whileHover={{ scale: 1.1 }}
                                                                                    >
                                                                                        {coach.ticketCount} উপলব্ধ
                                                                                    </motion.span>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            responseData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-yellow-100/80 border border-yellow-300 text-yellow-700 px-6 py-4 rounded-xl backdrop-blur-sm"
                                >
                                    <div className="flex items-center">
                                        <span className="mr-3">⚠️</span>
                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            নির্বাচিত তথ্যের জন্য কোন ট্রেন পাওয়া যায়নি।
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        )}

                        {/* Seat Selection Modal (if coach is selected) */}
                        {coachWiseTicketResponse && coachWiseTicketResponse.tickets && coachWiseTicketResponse.tickets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="mt-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-center mb-6"
                                >
                                    <h3 className="text-2xl font-bold text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        আসন বেছে নিন
                                    </h3>
                                    <p className="text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        কোচ: {bookingResponse.find(coach => coach.coachId === coachWiseTicketResponse.coachId)?.coachName || coachWiseTicketResponse.coachId}
                                    </p>
                                    <p className="text-sm text-purple-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        বেছে নিয়েছেন: {selectedSeats.length}/৪টি আসন
                                    </p>
                                </motion.div>

                                {/* Legend */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="flex flex-wrap justify-center gap-6 mb-6"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-white/50 border-2 border-green-500 rounded w-4 h-4 mr-2"></div>
                                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">খালি</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-green-500 rounded w-4 h-4 mr-2"></div>
                                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বেছে নিয়েছেন</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-yellow-500 rounded w-4 h-4 mr-2"></div>
                                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বুকিং হচ্ছে</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-red-500 rounded w-4 h-4 mr-2"></div>
                                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বুকড</span>
                                    </div>
                                </motion.div>

                                {/* Seat Selection Error Message as modal like ban error */}
                                {seatSelectionError && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="bg-white/95 backdrop-blur-xl border-2 border-red-400 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
                                        >
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-3xl text-red-500">⚠️</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-red-800 mb-3 font-['Noto_Sans_Bengali','SolaimanLipi','Kalpurush',serif]">
                                                    আসন নির্বাচন ত্রুটি
                                                </h3>
                                                <p className="text-red-700 mb-4 font-['Noto_Sans_Bengali','SolaimanLipi','Kalpurush',serif]">
                                                    {seatSelectionError}
                                                </p>
                                                <motion.button
                                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium font-['Noto_Sans_Bengali','SolaimanLipi','Kalpurush',serif]"
                                                    onClick={() => setSeatSelectionError("")}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    বন্ধ করুন
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Seat Layout */}
                                <div className="bg-white/30 border border-white/50 rounded-xl p-6 mb-6">
                                    <div className="text-center mb-4">
                                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            ট্রেনের সামনে
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {Array.from({ length: Math.ceil(coachWiseTicketResponse.seatCount / 5) }, (_, rowIndex) => {
                                            const startSeatNum = rowIndex * 5 + 1;
                                            const endSeatNum = Math.min(startSeatNum + 4, coachWiseTicketResponse.seatCount);

                                            return (
                                                <motion.div
                                                    key={rowIndex}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.5, delay: rowIndex * 0.1 }}
                                                    className="flex justify-center items-center gap-4"
                                                >
                                                    {/* Left side - 2 seats */}
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 2 }, (_, seatIndex) => {
                                                            const seatNum = startSeatNum + seatIndex;
                                                            if (seatNum > endSeatNum) return null;

                                                            const ticket = coachWiseTicketResponse.tickets.find(t => t.seatNum === seatNum.toString());
                                                            if (!ticket) return null;

                                                            const isSelected = selectedSeats.includes(ticket.ticketId);
                                                            const isAvailable = ticket.ticketStatus === "AVAILABLE";

                                                            return (
                                                                <motion.div
                                                                    key={seatNum}
                                                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer font-bold text-sm transition-all duration-300 ${isSelected
                                                                        ? 'bg-green-500 text-white border-green-600'
                                                                        : isAvailable
                                                                            ? 'bg-white/50 border-green-500 text-green-700 hover:bg-green-100'
                                                                            : ticket.ticketStatus === "IN PROGRESS"
                                                                                ? 'bg-yellow-500 text-white border-yellow-600 cursor-not-allowed'
                                                                                : 'bg-red-500 text-white border-red-600 cursor-not-allowed'
                                                                        }`}
                                                                    onClick={() => ticket && handleSeatSelection(ticket)}
                                                                    whileHover={isAvailable ? { scale: 1.1 } : {}}
                                                                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3, delay: seatIndex * 0.05 }}
                                                                >
                                                                    {seatNum}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Corridor */}
                                                    <div className="w-8 text-center">
                                                        <span className="text-orange-600 font-bold">||</span>
                                                    </div>

                                                    {/* Right side - 3 seats */}
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 3 }, (_, seatIndex) => {
                                                            const seatNum = startSeatNum + 2 + seatIndex;
                                                            if (seatNum > endSeatNum) return null;

                                                            const ticket = coachWiseTicketResponse.tickets.find(t => t.seatNum === seatNum.toString());
                                                            if (!ticket) return null;

                                                            const isSelected = selectedSeats.includes(ticket.ticketId);
                                                            const isAvailable = ticket.ticketStatus === "AVAILABLE";

                                                            return (
                                                                <motion.div
                                                                    key={seatNum}
                                                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer font-bold text-sm transition-all duration-300 ${isSelected
                                                                        ? 'bg-green-500 text-white border-green-600'
                                                                        : isAvailable
                                                                            ? 'bg-white/50 border-green-500 text-green-700 hover:bg-green-100'
                                                                            : ticket.ticketStatus === "IN PROGRESS"
                                                                                ? 'bg-yellow-500 text-white border-yellow-600 cursor-not-allowed'
                                                                                : 'bg-red-500 text-white border-red-600 cursor-not-allowed'
                                                                        }`}
                                                                    onClick={() => ticket && handleSeatSelection(ticket)}
                                                                    whileHover={isAvailable ? { scale: 1.1 } : {}}
                                                                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.3, delay: (seatIndex + 2) * 0.05 }}
                                                                >
                                                                    {seatNum}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Booking Button */}
                                {selectedSeats.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="text-center"
                                    >
                                        <motion.button
                                            onClick={handleBookSelectedSeats}
                                            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: "0 25px 50px rgba(255,102,0,0.4)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <motion.span
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                🎫
                                            </motion.span>
                                            <span>
                                                {selectedSeats.length}টি আসন বুক করুন
                                            </span>
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

export default SearchTrainForm;