import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import api from "../api";
import Navbar from "../components/navBar";

const BookingDetails = () => {
    const { bookingId } = useParams();
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
    const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);

    const [tickets, setTickets] = useState([]);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [userTypeInfo, setUserTypeInfo] = useState(null);
    const [holdTime, setHoldTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("");

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
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get("/booking/details", {
                    params: { bookingId },
                });
                setTickets(response.data);
                console.log(response.data);
                console.log(tickets);

                // Initialize passenger details state
                const initialPassengerDetails = response.data.map((ticket) => ({
                    ticketId: ticket.ticketId,
                    passengerName: "",
                    passengerType: "A", // default to Adult
                    fare: ticket.fare,
                }));
                setPassengerDetails(initialPassengerDetails);
            } catch (err) {
                console.error("Error fetching booking details:", err);
                setErrors({ general: "বুকিং এর তথ্য লোড করতে সমস্যা হয়েছে।" });
            } finally {
                setLoading(false);
            }
        };

        const fetchUserTypeInfo = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (userId) {
                    const response = await api.get(`/user/type/${userId}`);
                    setUserTypeInfo(response.data);
                    console.log("User type info:", response.data);
                }
            } catch (err) {
                console.error("Error fetching user type info:", err);
            }
        };

        const fetchHoldTime = async () => {
            try {
                const response = await api.get("/booking/holdtime", {
                    params: { bookingId },
                });
                console.log("=== FETCH HOLD TIME DEBUG ===");
                console.log("API Response:", response.data);
                console.log("Hold Time Value:", response.data.holdTime);
                console.log("Hold Time Type:", typeof response.data.holdTime);
                setHoldTime(response.data.holdTime);
                console.log("Hold time set to:", response.data.holdTime);
            } catch (err) {
                console.error("Error fetching hold time:", err);
            }
        };

        fetchBookingDetails();
        fetchUserTypeInfo();
        fetchHoldTime();
    }, [bookingId]);

    // Auto-fill first passenger details when both userTypeInfo and passengerDetails are available
    useEffect(() => {
        if (userTypeInfo && passengerDetails.length > 0 && !passengerDetails[0].passengerName) {
            const updated = [...passengerDetails];
            updated[0] = {
                ...updated[0],
                passengerName: userTypeInfo.fullName,
                passengerType: userTypeInfo.type
            };
            setPassengerDetails(updated);
            console.log("Auto-filled first passenger:", updated[0]);
        }
    }, [userTypeInfo, passengerDetails]);

    // Timer effect to update remaining time
    useEffect(() => {
        if (!holdTime) return;

        const updateTimer = () => {
            const now = new Date();

            // Parse the holdTime in format 'YYYY-MM-DD HH24:MI:SS'
            const holdDateTime = new Date(holdTime.replace(' ', 'T')); // Convert to ISO format for parsing

            console.log("=== TIMER DEBUG ===");
            console.log("Hold time string:", holdTime);
            console.log("Parsed hold time:", holdDateTime);
            console.log("Current time:", now);
            console.log("Hold time valid?", !isNaN(holdDateTime.getTime()));

            const timeDiff = holdDateTime.getTime() - now.getTime();
            console.log("Time difference (ms):", timeDiff);
            console.log("Time difference (minutes):", Math.floor(timeDiff / (1000 * 60)));

            if (timeDiff <= 0) {
                console.log("TIMER EXPIRED - Setting timeRemaining to EXPIRED");
                setTimeRemaining("EXPIRED");
                return;
            }

            const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);

            const timeString = `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
            console.log("Setting timeRemaining to:", timeString);
            setTimeRemaining(timeString);
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [holdTime]);

    const handlePassengerChange = (index, field, value) => {
        const updated = [...passengerDetails];
        updated[index][field] = value;
        setPassengerDetails(updated);

        // Clear error for this field when user starts typing
        if (errors[`${index}_${field}`]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[`${index}_${field}`];
            setErrors(updatedErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        passengerDetails.forEach((passenger, index) => {
            if (!passenger.passengerName.trim()) {
                newErrors[`${index}_passengerName`] = "যাত্রীর নাম আবশ্যক";
            }
            if (!passenger.passengerType) {
                newErrors[`${index}_passengerType`] = "যাত্রীর ধরন আবশ্যক";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGenerateInvoice = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post("/booking/invoice/create", passengerDetails);

            console.log("Invoice created successfully:", response.data);
            setInvoice(response.data);

        } catch (err) {
            console.error("Error creating invoice:", err);
            setErrors({ general: "ইনভয়েস তৈরি করতে সমস্যা হয়েছে।" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayNow = () => {
        // Show payment options
        setShowPaymentOptions(true);
    };

    const handleBkashPayment = async () => {
        // Handle Bkash payment logic here
        console.log("Processing payment for invoice:", invoice.invoiceId);

        try {
            // First save the invoice
            const saveResponse = await api.post("/booking/invoice/save", invoice);
            console.log("Invoice saved successfully:", saveResponse.data);

            // Then initiate payment
            const userId = localStorage.getItem("userId");
            const paymentResponse = await api.post("/payment/initiate", {
                invoiceId: invoice.invoiceId,
                amount: invoice.total,
                currency: "BDT",
                userId: userId
            });

            const { GatewayPageURL } = paymentResponse.data;

            if (GatewayPageURL) {
                // Open payment gateway in the same window
                window.location.href = GatewayPageURL;
            } else {
                console.error("No gateway URL received");
                setErrors({ general: "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" });
            }
        } catch (err) {
            console.error("Payment initiation error:", err);
            setErrors({ general: "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" });
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
                                className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <h2 className="text-2xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                বুকিং তথ্য লোড হচ্ছে...
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
            <div ref={containerRef} className="relative overflow-hidden min-h-screen">
                <motion.div style={{ backgroundColor, y: backgroundY }} className="fixed inset-0 z-0" />

                {/* Ambient Elements */}
                <div className="fixed inset-0 pointer-events-none z-1">
                    {[...Array(20)].map((_, i) => (
                        <FloatingParticle key={i} delay={i * 1.5} size={Math.random() > 0.5 ? 1 : 2} />
                    ))}
                </div>

                {/* Interactive Background Elements */}
                <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-2" style={{ y: backgroundY }}>
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
                </motion.div>

                {/* Main Content */}
                <main className="relative min-h-screen px-6 pt-32 pb-12 z-30">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-8"
                        >
                            <motion.h1
                                className="text-4xl md:text-5xl font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
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
                                বুকিং বিবরণ
                            </motion.h1>
                            <motion.div
                                className="flex items-center justify-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block"
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="text-2xl">🎫</span>
                                <span className="text-lg font-semibold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                    বুকিং আইডি: {bookingId}
                                </span>
                            </motion.div>
                        </motion.div>

                        {/* Timer Display */}
                        {timeRemaining && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${timeRemaining === "EXPIRED" ? "bg-red-100/80 border-red-300 text-red-800" : "bg-yellow-100/80 border-yellow-300 text-yellow-800"} px-6 py-4 rounded-xl backdrop-blur-sm mb-6 text-center ${timeRemaining !== "EXPIRED" && timeRemaining.startsWith("00:") && parseInt(timeRemaining.split(":")[1]) < 10 ? "animate-pulse border-2 border-red-500" : ""
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <motion.span
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="text-2xl"
                                    >
                                        ⏰
                                    </motion.span>
                                    <span className="font-semibold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        {timeRemaining === "EXPIRED" ? (
                                            <div className="space-y-2">
                                                <div>বুকিং হোল্ড টাইম শেষ! আবার চেষ্টা করুন।</div>
                                                <motion.button
                                                    className="bg-orange-500 text-white px-4 py-2 rounded-xl font-medium"
                                                    onClick={() => navigate('/search')}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    আবার চেষ্টা করুন
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <>
                                                এই সময়ের মধ্যে বুকিং সম্পন্ন করুন: {" "}
                                                <span className="bg-orange-800 text-white px-3 py-1 rounded-full text-lg ml-2">{timeRemaining}</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {invoice && !showPaymentOptions && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-100/80 border border-green-300 text-green-800 px-6 py-4 rounded-xl backdrop-blur-sm mb-6 text-center"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <motion.span
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="text-2xl"
                                    >
                                        ✅
                                    </motion.span>
                                    <span className="font-semibold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        ইনভয়েস সফলভাবে তৈরি হয়েছে! এখন পেমেন্ট করুন।
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* General Error Message */}
                        {errors.general && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-100/80 border border-red-300 text-red-800 px-6 py-4 rounded-xl backdrop-blur-sm mb-6"
                            >
                                <div className="flex items-center">
                                    <span className="mr-3">⚠️</span>
                                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        {errors.general}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* Passenger Details Forms */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl mb-8"
                        >
                            <h3 className="text-2xl font-bold text-orange-800 mb-6 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                যাত্রীদের তথ্য প্রদান করুন
                            </h3>

                            {userTypeInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-100/80 border border-blue-300 text-blue-800 px-4 py-3 rounded-xl mb-6 text-center"
                                >
                                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        <strong>প্রাথমিক যাত্রী:</strong> আপনার তথ্য স্বয়ংক্রিয়ভাবে পূরণ হয়েছে। প্রয়োজনে পরিবর্তন করতে পারেন।
                                    </span>
                                </motion.div>
                            )}

                            <div className="space-y-6">
                                {tickets.map((ticket, index) => (
                                    <motion.div
                                        key={ticket.ticketId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="bg-white/40 rounded-xl p-6 border border-white/50"
                                        whileHover={{ scale: 1.02, y: -5 }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <motion.h4
                                                className="text-xl font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                whileHover={{ color: "#ff6600" }}
                                            >
                                                🧑‍💼 যাত্রী {index + 1}
                                            </motion.h4>
                                            <motion.span
                                                className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium shadow-md"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                🪑 আসন {ticket.seatNum}
                                            </motion.span>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    যাত্রীর নাম *
                                                </label>
                                                <motion.input
                                                    type="text"
                                                    required
                                                    value={passengerDetails[index]?.passengerName || ""}
                                                    onChange={(e) =>
                                                        handlePassengerChange(index, "passengerName", e.target.value)
                                                    }
                                                    disabled={timeRemaining === "EXPIRED"}
                                                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors[`${index}_passengerName`]
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-orange-300'
                                                        } ${timeRemaining === "EXPIRED" ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    placeholder="যাত্রীর পূর্ণ নাম লিখুন"
                                                    whileFocus={timeRemaining !== "EXPIRED" ? {
                                                        scale: 1.02,
                                                        boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                                    } : {}}
                                                />
                                                {errors[`${index}_passengerName`] && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-600 text-sm mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                    >
                                                        {errors[`${index}_passengerName`]}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    যাত্রীর ধরন *
                                                </label>
                                                <motion.select
                                                    value={passengerDetails[index]?.passengerType || "A"}
                                                    onChange={(e) =>
                                                        handlePassengerChange(index, "passengerType", e.target.value)
                                                    }
                                                    disabled={timeRemaining === "EXPIRED"}
                                                    className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors[`${index}_passengerType`]
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-orange-300'
                                                        } ${timeRemaining === "EXPIRED" ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    whileFocus={timeRemaining !== "EXPIRED" ? {
                                                        scale: 1.02,
                                                        boxShadow: "0 0 20px rgba(255,102,0,0.3)"
                                                    } : {}}
                                                >
                                                    <option value="A">🧑‍💼 প্রাপ্তবয়স্ক</option>
                                                    <option value="C">👶 শিশু</option>
                                                </motion.select>
                                                {errors[`${index}_passengerType`] && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-600 text-sm mt-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                                    >
                                                        {errors[`${index}_passengerType`]}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <motion.div
                                                className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border border-orange-200"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <span>🚂</span>
                                                        <span className="font-medium text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                            কোচ: {ticket.coachId}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span>💰</span>
                                                        <span className="font-bold text-orange-800">
                                                            ভাড়া: ৳{ticket.fare}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Total Fare and Submit Button */}
                        {!invoice && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl"
                            >
                                <div className="text-center mb-6">
                                    <motion.div
                                        className="inline-flex items-center space-x-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-8 py-4"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="text-3xl">💰</span>
                                        <div>
                                            <p className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                মোট ভাড়া
                                            </p>
                                            <p className="text-2xl font-bold text-orange-800">
                                                {tickets.reduce((sum, ticket) => sum + ticket.fare, 0)} টাকা
                                            </p>
                                        </div>
                                    </motion.div>
                                    <p className="text-sm text-gray-600 mt-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        দ্রষ্টব্য: শিশুদের ভাড়া ইনভয়েসে সমন্বয় করা হবে
                                    </p>
                                </div>

                                <div className="text-center">
                                    <motion.button
                                        onClick={handleGenerateInvoice}
                                        disabled={isSubmitting || timeRemaining === "EXPIRED"}
                                        className={`
                                            ${isSubmitting || timeRemaining === "EXPIRED"
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:shadow-orange-300'
                                            } 
                                            text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 
                                            flex items-center justify-center space-x-3 mx-auto 
                                            font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]
                                        `}
                                        whileHover={!isSubmitting && timeRemaining !== "EXPIRED" ? {
                                            scale: 1.05,
                                            boxShadow: "0 25px 50px rgba(255,102,0,0.4)"
                                        } : {}}
                                        whileTap={!isSubmitting && timeRemaining !== "EXPIRED" ? { scale: 0.95 } : {}}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span>ইনভয়েস তৈরি হচ্ছে...</span>
                                            </>
                                        ) : timeRemaining === "EXPIRED" ? (
                                            <>
                                                <span>⏰</span>
                                                <span>বুকিং মেয়াদ শেষ</span>
                                            </>
                                        ) : (
                                            <>
                                                <motion.span
                                                    animate={{ y: [0, -2, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    📄
                                                </motion.span>
                                                <span>ইনভয়েস তৈরি করুন</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Invoice Display */}
                        {invoice && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl"
                            >
                                <motion.div
                                    className="text-center mb-6"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <h3 className="text-2xl font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        ইনভয়েস বিবরণ
                                    </h3>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <motion.div
                                        className="bg-white/30 rounded-xl p-4"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <p className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] mb-1">
                                            <strong>ইনভয়েস আইডি:</strong>
                                        </p>
                                        <p className="font-bold text-orange-800">{invoice.invoiceId}</p>

                                        <p className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] mb-1 mt-3">
                                            <strong>বুকিং আইডি:</strong>
                                        </p>
                                        <p className="font-bold text-orange-800">{invoice.bookingId}</p>
                                    </motion.div>

                                    <motion.div
                                        className="bg-white/30 rounded-xl p-4"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">মূল ভাড়া:</span>
                                                <span className="font-bold text-orange-800">৳{invoice.baseFare.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">ভ্যাট:</span>
                                                <span className="font-bold text-orange-800">৳{invoice.vat.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">সার্ভিস চার্জ:</span>
                                                <span className="font-bold text-orange-800">৳{invoice.serviceCharge.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বেডিং চার্জ:</span>
                                                <span className="font-bold text-orange-800">৳{invoice.beddingCharge.toFixed(2)}</span>
                                            </div>
                                            <hr className="border-orange-300" />
                                            <div className="flex justify-between">
                                                <span className="text-lg font-bold text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">মোট পরিমাণ:</span>
                                                <span className="text-lg font-bold text-orange-800">৳{invoice.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="text-center">
                                    <motion.button
                                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-300 transition-all duration-300 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                                        onClick={handleBkashPayment} // Or handleBkashPayment if you're using bKash directly
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        এখনই পেমেন্ট করুন - ৳{invoice.total.toFixed(2)}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default BookingDetails;