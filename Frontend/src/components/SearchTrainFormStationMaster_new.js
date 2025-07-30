import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./navBar";

const SearchTrainFormStationMaster = () => {
  const [searchData, setSearchData] = useState({
    fromStation: "",
    toStation: "",
    date: null,
    class_: "",
  });
  const [seatSelectionError, setSeatSelectionError] = useState("");
      
  const [availableDates, setAvailableDates] = useState([]);
  const [fromStations, setFromStations] = useState([]);
  const [toStations, setToStations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [bookingResponse, setBookingResponse] = useState(null);
  const [coachWiseTicketResponse, setCoachWiseTicketResponse] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currCoach, setCurrCoach] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation refs and values
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const cloudY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fromRes, toRes, dateRes, classRes] = await Promise.all([
          api.get("/stations/from/stationmaster"),
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
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Floating particles for ambiance
  const FloatingParticle = ({ delay = 0, size = 2 }) => (
    <motion.div
      className={`absolute w-${size} h-${size} bg-orange-300/20 rounded-full blur-sm`}
      initial={{
        x:
          typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
        y: typeof window !== "undefined" ? window.innerHeight + 100 : 0,
        opacity: 0,
      }}
      animate={{
        x:
          typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
        y: -100,
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        delay: delay + Math.random() * 5,
        repeat: Infinity,
        ease: "linear",
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
        ease: "easeOut",
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          x: [0, 15, -5, 0],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 8 + delay,
          repeat: Infinity,
          ease: "easeInOut",
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

  const handleDateChange = (d) => {
    setSearchData((prev) => ({ ...prev, date: d }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchData.date || !searchData.fromStation || !searchData.toStation) {
      setError("অনুগ্রহ করে সব ক্ষেত্র পূরণ করুন।");
      return;
    }

    if (searchData.fromStation === searchData.toStation) {
      setError("গন্তব্য এবং প্রস্থান স্টেশন একই হতে পারে না।");
      return;
    }

    setError("");
    setLoading(true);

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
      setError("ট্রেন অনুসন্ধানে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelectedSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat."); //??remove alert
      return;
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
      navigate(`/booking/stationMaster/${bookingId}`); //alert(`Successfully booked ${selectedSeats.length} seats!`);

      // Reset selections and refresh data
      setSelectedSeats([]);
      // You might want to refresh the coach data here
    } catch (err) {
      console.error("Seat booking failed:", err);
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        alert("Seat booking failed. Please try again.");
      }
    }
  };

  const handleBookNow = async (trainId, classId) => {
    try {
      const formattedDate = searchData.date
        ? searchData.date.toLocaleDateString("en-GB").replace(/\//g, "-")
        : null;

      if (!formattedDate) {
        alert("Please select a valid date before booking.");
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
      // Reset coach selection and seat selection when new booking is made
      setCoachWiseTicketResponse(null);
      setSelectedSeats([]);
      console.log("Booking response:", enhancedBookingResponse);
    } catch (err) {
      console.error("Booking failed:", err);
      if (err.response && err.response.status === 401) {
        alert("Please login to continue.");
        window.location.href = "/login"; // or use navigate()
      } else {
        alert("Booking failed. Please try again.");
      }
    }
  };

  const handleCoachSelection = async (coachId) => {
    try {
      if (!searchData.date) {
        alert("Please select a valid date before proceeding.");
        return;
      }
      setCurrCoach(coachId);
      setCoachWiseTicketResponse(null);

      const selectedCoach = bookingResponse.find(
        (coach) => coach.coachId === coachId
      );

      const formattedDate = searchData.date
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
      console.log(`Coach selected: coachId=${coachId}, date=${formattedDate}`);

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
        window.location.href = "/login";
      } else {
        alert("Coach selection failed. Please try again.");
      }
    }
  };

  const handleSeatSelection = async (ticket) => {
    if (selectedSeats.includes(ticket.ticketId)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== ticket.ticketId));
      return;
    }

    // if (selectedSeats.length >= 4) {
    //   alert("You can select maximum 4 seats.");
    //   return;
    // }

    try {
      const response = await api.post("/book/seat/select", {
        ticketId: ticket.ticketId,
      });

      const status = response.data;

      if (status === "AVAILABLE") {
        setSelectedSeats((prev) => [...prev, ticket.ticketId]);
      } else {
        setCoachWiseTicketResponse((prev) => ({
          ...prev,
          tickets: prev.tickets.map((t) =>
            t.ticketId === ticket.ticketId ? { ...t, ticketStatus: status } : t
          ),
        }));

        let errorMessage = "This seat is not available.";
        if (status === "BOOKED") {
          errorMessage = "This seat has already been booked.";
        } else if (status === "IN PROGRESS") {
          errorMessage = "This seat is currently being booked by another user.";
        }

        alert(errorMessage);
      }
    } catch (err) {
      console.error("Seat selection failed:", err);

      if (err.response) {
        if (err.response.status === 404) {
          alert("Seat information not found.");
        } else if (err.response.status === 500) {
          alert("Server error. Please try again.");
        } else {
          alert("An error occurred. Please try again.");
        }
      } else {
        alert("Network error. Please check your connection.");
      }
    }
  };

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    try {
      const response = await api.post("/book/payment/confirm", {
        ticketIds: selectedSeats,
      });

      console.log("Payment initiated:", response.data);

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        alert("Payment processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <motion.div
          className="text-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p
            className="text-xl font-semibold text-gray-700"
            style={{
              fontFamily:
                "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
            }}
          >
            লোড হচ্ছে...
          </p>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      {/* Dynamic gradient background */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br"
        style={{
          background:
            scrollYProgress && y
              ? `linear-gradient(135deg, 
                hsl(${180 + scrollYProgress.get() * 180}, 80%, ${
                  85 - scrollYProgress.get() * 15
                }%), 
                hsl(${30 + scrollYProgress.get() * 180}, 75%, ${
                  90 - scrollYProgress.get() * 20
                }%), 
                hsl(${350 + scrollYProgress.get() * 180}, 70%, ${
                  95 - scrollYProgress.get() * 25
                }%))`
              : "linear-gradient(135deg, #e0f2fe, #fff3e0, #fce4ec)",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, #e0f2fe, #fff3e0, #fce4ec)",
            "linear-gradient(135deg, #f3e5f5, #e8f5e8, #fff8e1)",
            "linear-gradient(135deg, #e0f2fe, #fff3e0, #fce4ec)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Interactive gradient orbs */}
      <motion.div
        className="fixed w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-r from-orange-300 to-rose-300"
        style={{
          x: mouseX ? mouseX * 0.1 : 0,
          y: mouseY ? mouseY * 0.1 : 0,
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
        className="fixed w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-r from-cyan-300 to-blue-300"
        style={{
          x: mouseX ? mouseX * -0.1 + 200 : 200,
          y: mouseY ? mouseY * -0.1 + 100 : 100,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 2}
          size={Math.random() > 0.5 ? 3 : 2}
        />
      ))}

      {/* Animated clouds */}
      <Cloud className="top-10 left-10" delay={0} scale={0.8} />
      <Cloud className="top-20 right-20" delay={2} scale={1.2} />
      <Cloud className="top-32 left-1/3" delay={4} scale={0.9} />

      {/* Train icon animation */}
      <motion.div
        className="fixed top-16 right-16 text-6xl"
        animate={{
          x: [0, 20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🚂
      </motion.div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-rose-600 to-purple-600 bg-clip-text text-transparent"
            style={{
              fontFamily:
                "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ট্রেন অনুসন্ধান
          </motion.h1>
          <motion.p
            className="text-xl text-gray-700 font-medium"
            style={{
              fontFamily:
                "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            আপনার যাত্রার জন্য সেরা ট্রেন খুঁজুন
          </motion.p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Station */}
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label
                    className="block text-lg font-semibold text-gray-800 mb-2"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                  >
                    🚉 প্রস্থান স্টেশন
                  </label>
                  <motion.select
                    name="fromStation"
                    value={searchData.fromStation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/50 focus:bg-white/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 font-medium"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                    whileFocus={{ scale: 1.02 }}
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
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label
                    className="block text-lg font-semibold text-gray-800 mb-2"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                  >
                    🏁 গন্তব্য স্টেশন
                  </label>
                  <motion.select
                    name="toStation"
                    value={searchData.toStation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/50 focus:bg-white/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 font-medium"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                    whileFocus={{ scale: 1.02 }}
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
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label
                    className="block text-lg font-semibold text-gray-800 mb-2"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                  >
                    📅 যাত্রার তারিখ
                  </label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <DatePicker
                      selected={searchData.date}
                      onChange={handleDateChange}
                      includeDates={availableDates}
                      placeholderText="তারিখ নির্বাচন করুন"
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/50 focus:bg-white/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 font-medium"
                      dateFormat="dd-MM-yyyy"
                      required
                      style={{
                        fontFamily:
                          "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Class */}
                <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                  <label
                    className="block text-lg font-semibold text-gray-800 mb-2"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                  >
                    🎫 শ্রেণী
                  </label>
                  <motion.select
                    name="class_"
                    value={searchData.class_}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/50 focus:bg-white/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 font-medium"
                    style={{
                      fontFamily:
                        "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                    }}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">শ্রেণী নির্বাচন করুন</option>
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.className}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-center font-medium"
                  style={{
                    fontFamily:
                      "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{
                    fontFamily:
                      "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                  }}
                  animate={{
                    boxShadow: [
                      "0 4px 15px rgba(249, 115, 22, 0.4)",
                      "0 8px 25px rgba(236, 72, 153, 0.4)",
                      "0 4px 15px rgba(249, 115, 22, 0.4)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center space-x-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>অনুসন্ধান করা হচ্ছে...</span>
                    </motion.div>
                  ) : (
                    "🔍 ট্রেন অনুসন্ধান করুন"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Train Results Section */}
        {responseData && responseData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <motion.h3
              className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{
                fontFamily:
                  "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
              }}
            >
              🚆 উপলব্ধ ট্রেন
            </motion.h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {responseData.map((train, index) => (
                <motion.div
                  key={train.trainId}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="backdrop-blur-xl bg-white/25 rounded-2xl p-6 shadow-xl border border-white/40 hover:bg-white/35 transition-all duration-300"
                >
                  <motion.div
                    className="flex items-center justify-between mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <div>
                      <h4
                        className="text-xl font-bold text-gray-800"
                        style={{
                          fontFamily:
                            "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                        }}
                      >
                        {train.trainName}
                      </h4>
                      <p className="text-gray-600 font-medium">
                        ট্রেন নং: {train.trainId}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-3xl"
                    >
                      🚆
                    </motion.div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-100/50 rounded-xl border border-green-200/50">
                      <p
                        className="text-sm text-green-700 font-medium"
                        style={{
                          fontFamily:
                            "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                        }}
                      >
                        🚉 প্রস্থান
                      </p>
                      <p className="text-lg font-bold text-green-800">
                        {train.departureTime}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-100/50 rounded-xl border border-blue-200/50">
                      <p
                        className="text-sm text-blue-700 font-medium"
                        style={{
                          fontFamily:
                            "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                        }}
                      >
                        🏁 পৌঁছানো
                      </p>
                      <p className="text-lg font-bold text-blue-800">
                        {train.arrivalTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {train.classes.map((cls, clsIndex) => (
                      <motion.div
                        key={clsIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1 + clsIndex * 0.1 + 0.5,
                        }}
                        className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/40"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5
                              className="font-bold text-gray-800"
                              style={{
                                fontFamily:
                                  "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                              }}
                            >
                              🎫 {cls.className}
                            </h5>
                            <p className="text-gray-600">
                              <span
                                className="font-semibold"
                                style={{
                                  fontFamily:
                                    "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                                }}
                              >
                                ভাড়া:
                              </span>{" "}
                              {cls.fare} টাকা
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-sm text-gray-600"
                              style={{
                                fontFamily:
                                  "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                              }}
                            >
                              উপলব্ধ আসন
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {cls.availableCount}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          onClick={() =>
                            handleBookNow(train.trainId, cls.classId)
                          }
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          style={{
                            fontFamily:
                              "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          animate={{
                            boxShadow: [
                              "0 4px 15px rgba(34, 197, 94, 0.4)",
                              "0 8px 25px rgba(16, 185, 129, 0.4)",
                              "0 4px 15px rgba(34, 197, 94, 0.4)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          🎫 এখনই বুক করুন
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coach selection and seat booking section */}
        {bookingResponse && bookingResponse.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-6xl mx-auto mt-8"
          >
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30">
              <motion.h4
                className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                style={{
                  fontFamily:
                    "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                }}
              >
                🚆 কোচ নির্বাচন করুন
              </motion.h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {bookingResponse.map((coach, coachIndex) => (
                  <motion.div
                    key={coachIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: coachIndex * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/40 cursor-pointer hover:bg-white/40 transition-all duration-300"
                    onClick={() => handleCoachSelection(coach.coachId)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚃</div>
                      <h6
                        className="font-bold text-gray-800 mb-1"
                        style={{
                          fontFamily:
                            "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
                        }}
                      >
                        {coach.coachName}
                      </h6>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {coach.ticketCount} উপলব্ধ
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Seat Selection Modal (if coach is selected) */}
              {coachWiseTicketResponse &&
                coachWiseTicketResponse.tickets &&
                coachWiseTicketResponse.tickets.length > 0 && (
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
                        কোচ:{" "}
                        {bookingResponse.find(
                          (coach) =>
                            coach.coachId === coachWiseTicketResponse.coachId
                        )?.coachName || coachWiseTicketResponse.coachId}
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
                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          খালি
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-500 rounded w-4 h-4 mr-2"></div>
                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          বেছে নিয়েছেন
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-yellow-500 rounded w-4 h-4 mr-2"></div>
                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          বুকিং হচ্ছে
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-red-500 rounded w-4 h-4 mr-2"></div>
                        <span className="text-sm text-orange-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                          বুকড
                        </span>
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
                        {Array.from(
                          {
                            length: Math.ceil(
                              coachWiseTicketResponse.seatCount / 5
                            ),
                          },
                          (_, rowIndex) => {
                            const startSeatNum = rowIndex * 5 + 1;
                            const endSeatNum = Math.min(
                              startSeatNum + 4,
                              coachWiseTicketResponse.seatCount
                            );

                            return (
                              <motion.div
                                key={rowIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: rowIndex * 0.1,
                                }}
                                className="flex justify-center items-center gap-4"
                              >
                                {/* Left side - 2 seats */}
                                <div className="flex gap-2">
                                  {Array.from({ length: 2 }, (_, seatIndex) => {
                                    const seatNum = startSeatNum + seatIndex;
                                    if (seatNum > endSeatNum) return null;

                                    const ticket =
                                      coachWiseTicketResponse.tickets.find(
                                        (t) => t.seatNum === seatNum.toString()
                                      );
                                    if (!ticket) return null;

                                    const isSelected = selectedSeats.includes(
                                      ticket.ticketId
                                    );
                                    const isAvailable =
                                      ticket.ticketStatus === "AVAILABLE";

                                    return (
                                      <motion.div
                                        key={seatNum}
                                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer font-bold text-sm transition-all duration-300 ${
                                          isSelected
                                            ? "bg-green-500 text-white border-green-600"
                                            : isAvailable
                                            ? "bg-white/50 border-green-500 text-green-700 hover:bg-green-100"
                                            : ticket.ticketStatus ===
                                              "IN PROGRESS"
                                            ? "bg-yellow-500 text-white border-yellow-600 cursor-not-allowed"
                                            : "bg-red-500 text-white border-red-600 cursor-not-allowed"
                                        }`}
                                        onClick={() =>
                                          ticket && handleSeatSelection(ticket)
                                        }
                                        whileHover={
                                          isAvailable ? { scale: 1.1 } : {}
                                        }
                                        whileTap={
                                          isAvailable ? { scale: 0.95 } : {}
                                        }
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: seatIndex * 0.05,
                                        }}
                                      >
                                        {seatNum}
                                      </motion.div>
                                    );
                                  })}
                                </div>

                                {/* Corridor */}
                                <div className="w-8 text-center">
                                  <span className="text-orange-600 font-bold">
                                    ||
                                  </span>
                                </div>

                                {/* Right side - 3 seats */}
                                <div className="flex gap-2">
                                  {Array.from({ length: 3 }, (_, seatIndex) => {
                                    const seatNum =
                                      startSeatNum + 2 + seatIndex;
                                    if (seatNum > endSeatNum) return null;

                                    const ticket =
                                      coachWiseTicketResponse.tickets.find(
                                        (t) => t.seatNum === seatNum.toString()
                                      );
                                    if (!ticket) return null;

                                    const isSelected = selectedSeats.includes(
                                      ticket.ticketId
                                    );
                                    const isAvailable =
                                      ticket.ticketStatus === "AVAILABLE";

                                    return (
                                      <motion.div
                                        key={seatNum}
                                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer font-bold text-sm transition-all duration-300 ${
                                          isSelected
                                            ? "bg-green-500 text-white border-green-600"
                                            : isAvailable
                                            ? "bg-white/50 border-green-500 text-green-700 hover:bg-green-100"
                                            : ticket.ticketStatus ===
                                              "IN PROGRESS"
                                            ? "bg-yellow-500 text-white border-yellow-600 cursor-not-allowed"
                                            : "bg-red-500 text-white border-red-600 cursor-not-allowed"
                                        }`}
                                        onClick={() =>
                                          ticket && handleSeatSelection(ticket)
                                        }
                                        whileHover={
                                          isAvailable ? { scale: 1.1 } : {}
                                        }
                                        whileTap={
                                          isAvailable ? { scale: 0.95 } : {}
                                        }
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: (seatIndex + 2) * 0.05,
                                        }}
                                      >
                                        {seatNum}
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            );
                          }
                        )}
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
                            boxShadow: "0 25px 50px rgba(255,102,0,0.4)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            🎫
                          </motion.span>
                          <span>{selectedSeats.length}টি আসন বুক করুন</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
            </div>
          </motion.div>
        )}

        {/* {responseData && responseData.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4"
            >
              🔍
            </motion.div>
            <h3
              className="text-2xl font-bold text-gray-700 mb-2"
              style={{
                fontFamily:
                  "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
              }}
            >
              কোনো ট্রেন পাওয়া যায়নি
            </h3>
            <p
              className="text-gray-600"
              style={{
                fontFamily:
                  "'Noto_Sans_Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
              }}
            >
              অন্য তারিখ বা রুট দিয়ে চেষ্টা করুন
            </p>
          </motion.div>
        )} */}
      </div>
    </div>
  );
};

export default SearchTrainFormStationMaster;
