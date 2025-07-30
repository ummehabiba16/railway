import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./navBar";
import api from "../api";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';

function MyBookingsStationMaster() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms - using the standard blue theme
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);
  const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#e6f9ff", "#b3edff", "#00c3ff"]);
  const [bookings, setBooking] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [ticketDetails, setTicketDetails] = useState({});
  const [loading, setLoading] = useState({});
  const [refundEligibility, setRefundEligibility] = useState({});
  const [refundStatus, setRefundStatus] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [loadingRefundAmount, setLoadingRefundAmount] = useState(false);
  const [holdTimes, setHoldTimes] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const ticketRef = useRef();

  // Notification functions
  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message) => showNotification(message, 'success');
  const showError = (message) => showNotification(message, 'error');
  const showInfo = (message) => showNotification(message, 'info');
  const showWarning = (message) => showNotification(message, 'warning');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings", {
          params: {
            userId: localStorage.getItem("userId")
          }
        });
        console.log(response.data);
        setBooking(response.data);
        
        // Check refund eligibility for SUCCESSFUL bookings and refund status for RefundPgr bookings
        response.data.forEach(booking => {
          if (booking.status === 'SUCCESSFUL') {
            checkRefundEligibility(booking.bookingId);
          } else if (booking.status === 'RefundPgr') {
            checkRefundStatus(booking.bookingId);
          } else if (booking.status === 'PENDING') {
            fetchHoldTime(booking.bookingId);
          }
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);
        // Handle 404 case - no bookings found
        if (error.response && error.response.status === 404) {
          setBooking([]); // Set empty array for no bookings
          showInfo("No bookings found for this user.");
        } else {
          // Handle other errors
          showError("Error loading bookings. Please try again.");
          setBooking([]); // Set empty array to prevent loading spinner
        }
      }
    };

    fetchBookings();
  }, []);

  const fetchHoldTime = async (bookingId) => {
    try {
      const response = await api.get("/booking/holdtime", {
        params: { bookingId }
      });
      setHoldTimes(prev => ({ ...prev, [bookingId]: response.data.holdTime }));
    } catch (error) {
      console.error("Error fetching hold time:", error);
    }
  };

  // Timer effect for pending bookings
  useEffect(() => {
    const intervals = {};

    Object.keys(holdTimes).forEach(bookingId => {
      const holdTime = holdTimes[bookingId];
      if (holdTime) {
        intervals[bookingId] = setInterval(() => {
          const now = new Date();
          const holdDateTime = new Date(holdTime.replace(' ', 'T'));
          const timeDiff = holdDateTime.getTime() - now.getTime();

          if (timeDiff <= 0) {
            setTimeRemaining(prev => ({ ...prev, [bookingId]: "EXPIRED" }));
            // Update booking status to FAILED in local state
            setBooking(prevBookings => 
              prevBookings.map(booking => 
                booking.bookingId === bookingId 
                  ? { ...booking, status: 'FAILED' }
                  : booking
              )
            );
            clearInterval(intervals[bookingId]);
          } else {
            const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            setTimeRemaining(prev => ({ 
              ...prev, 
              [bookingId]: `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`
            }));
          }
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [holdTimes]);

  // Periodic check for RefundPgr bookings
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookings) {
        bookings.forEach(booking => {
          if (booking.status === 'RefundPgr') {
            checkRefundStatus(booking.bookingId);
          }
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [bookings]);

  const fetchTicketDetails = async (bookingId) => {
    try {
      setLoading(prev => ({ ...prev, [bookingId]: true }));
      const response = await api.post("/ticket/stationmaster/booking", { bookingId });
      setTicketDetails(prev => ({ ...prev, [bookingId]: response.data }));
      setLoading(prev => ({ ...prev, [bookingId]: false }));
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const toggleDetails = async (bookingId) => {
    const isCurrentlyShowing = showDetails[bookingId];
    
    if (!isCurrentlyShowing && !ticketDetails[bookingId]) {
      await fetchTicketDetails(bookingId);
    }
    
    setShowDetails(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const handleRefund = async (bookingId) => {
    setSelectedBookingForRefund(bookingId);
    setShowRefundModal(true);
    setLoadingRefundAmount(true);
    setRefundAmount(0);
    
    try {
      // Get the actual refund amount from backend
      const response = await api.get(`/refund/calculate?bookingId=${bookingId}`);
      if (response.status === 200) {
        setRefundAmount(response.data.refundAmount);
      }
    } catch (error) {
      console.error("Error calculating refund amount:", error);
      showError("Error calculating refund amount. Please try again.");
      setRefundAmount(0);
    } finally {
      setLoadingRefundAmount(false);
    }
  };

  const confirmRefund = async () => {
    const bookingId = selectedBookingForRefund;
    try {
      console.log(`Processing refund for booking: ${bookingId}`);
      setShowRefundModal(false);
      setLoading(prev => ({ ...prev, [`refund_${bookingId}`]: true }));
      
      const refundRequest = {
        bookingId: bookingId,
        refundRemarks: "Customer requested refund, refunded by station master"
      };

      const response = await api.post("/refund/initiate/stationMaster", refundRequest);
      
      if (response.status === 200) {
        const result = response.data;
        if (result.status === 'success') {
          showSuccess(`Refund processed successfully! Refund amount: ৳${result.refundAmount}. Reference ID: ${result.refundRefId}`);
          // Update the booking status locally to 'Refunded' since Station Master processes immediately
          setBooking(prevBookings => 
            prevBookings.map(booking => 
              booking.bookingId === bookingId 
                ? { ...booking, status: 'Refunded' }
                : booking
            )
          );
          // Update refund status in local state
          setRefundStatus(prev => ({
            ...prev,
            [bookingId]: {
              refundAmount: result.refundAmount,
              refundRefId: result.refundRefId,
              refundStatus: 'Completed'
            }
          }));
        } else {
          showError(`Refund initiation failed: ${result.errorReason || result.message || 'Unknown error'}`);
        }
      }
      
      setLoading(prev => ({ ...prev, [`refund_${bookingId}`]: false }));
    } catch (error) {
      console.error("Error processing refund:", error);
      // Handle specific error messages from backend
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.errorReason || "Error processing refund. Please try again.";
        showError(errorMessage);
      } else {
        showError("Error processing refund. Please try again.");
      }
      setLoading(prev => ({ ...prev, [`refund_${bookingId}`]: false }));
    }
    setSelectedBookingForRefund(null);
  };

  const checkRefundEligibility = async (bookingId) => {
    try {
      const response = await api.get(`/refund/eligibility?bookingId=${bookingId}`);
      if (response.status === 200) {
        setRefundEligibility(prev => ({
          ...prev,
          [bookingId]: response.data
        }));
      }
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
      setRefundEligibility(prev => ({
        ...prev,
        [bookingId]: { eligible: false, estimatedRefund: 0, message: "Error checking eligibility" }
      }));
    }
  };

  const checkRefundStatus = async (bookingId) => {
    try {
      // Check if we already have the refund details with refundRefId
      if (refundStatus[bookingId] && refundStatus[bookingId].refundRefId) {
        // Use the direct status endpoint with refundRefId for better performance
        const refundRefId = refundStatus[bookingId].refundRefId;
        console.log(`Checking refund status directly with refundRefId: ${refundRefId}`);
        
        try {
          const statusResponse = await api.get(`/refund/status?refundRefId=${refundRefId}`);
          if (statusResponse.status === 200) {
            const statusData = statusResponse.data;
            console.log(`Direct status check result:`, statusData);
            
            // Update local state based on SSLCommerz response
            if (statusData.status === 'refunded') {
              // Update booking status to 'Refunded'
              setBooking(prevBookings => 
                prevBookings.map(booking => 
                  booking.bookingId === bookingId 
                    ? { ...booking, status: 'Refunded' }
                    : booking
                )
              );
              
              setRefundStatus(prev => ({
                ...prev,
                [bookingId]: { ...prev[bookingId], refundStatus: 'Completed' }
              }));
              
              showSuccess(`Refund completed! Amount: ৳${refundStatus[bookingId].refundAmount}`);
            } else if (statusData.status === 'processing') {
              showInfo('Refund is still being processed. Please check again later.');
            } else {
              showWarning(`Refund status: ${statusData.status}`);
            }
            return; // Exit early since we got the status directly
          }
        } catch (statusError) {
          console.error("Error checking refund status directly:", statusError);
          // Fall back to the booking method if direct status check fails
        }
      }

      // Fallback: Get refund details first if we don't have refundRefId
      console.log(`Getting refund details for booking: ${bookingId}`);
      const refundResponse = await api.get(`/refund/booking?bookingId=${bookingId}`);
      if (refundResponse.status === 200) {
        const refund = refundResponse.data;
        setRefundStatus(prev => ({
          ...prev,
          [bookingId]: refund
        }));

        // Now check status with the refundRefId if available
        if (refund.refundRefId && refund.refundStatus === 'Processing') {
          try {
            const statusResponse = await api.get(`/refund/status?refundRefId=${refund.refundRefId}`);
            if (statusResponse.status === 200) {
              const statusData = statusResponse.data;
              
              // Update local state based on SSLCommerz response
              if (statusData.status === 'refunded') {
                // Update booking status to 'Refunded'
                setBooking(prevBookings => 
                  prevBookings.map(booking => 
                    booking.bookingId === bookingId 
                      ? { ...booking, status: 'Refunded' }
                      : booking
                  )
                );
                
                setRefundStatus(prev => ({
                  ...prev,
                  [bookingId]: { ...refund, refundStatus: 'Completed' }
                }));
                
                showSuccess(`Refund completed! Amount: ৳${refund.refundAmount}`);
              } else if (statusData.status === 'processing') {
                showInfo('Refund is still being processed. Please check again later.');
              } else {
                showWarning(`Refund status: ${statusData.status}`);
              }
            }
          } catch (statusError) {
            console.error("Error checking refund status with SSLCommerz:", statusError);
            showError("Error checking refund status. Please try again.");
          }
        } else {
          showInfo(`Refund status: ${refund.refundStatus}`);
        }
      }
    } catch (error) {
      console.error("Error getting refund details:", error);
      showError("Error checking refund status. Please try again.");
    }
  };

  const downloadTicketPDF = (bookingId) => {
    const ticketElement = document.getElementById(`ticket-${bookingId}`);
    if (ticketElement) {
      html2canvas(ticketElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ticket-${bookingId}.pdf`);
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-200 text-yellow-800';
      case 'SUCCESSFUL':
        return 'bg-green-200 text-green-800';
      case 'FAILED':
        return 'bg-red-200 text-red-800';
      case 'RefundPgr':
        return 'bg-blue-200 text-blue-800';
      case 'Refunded':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (!bookings) {
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
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-1">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-blue-300/20 rounded-full blur-sm`}
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
                delay: i * 1.5 + Math.random() * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <main className="relative min-h-screen px-6 pt-32 pb-12 z-30">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                স্টেশন মাস্টার বুকিং সমূহ
              </h1>
              <p className="text-blue-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                সকল ট্রেনের টিকিট বুকিং এর তালিকা (স্টেশন মাস্টার ভিউ)
              </p>
            </motion.div>

            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-blue-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  কোন বুকিং পাওয়া যায়নি
                </h3>
                <p className="text-blue-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  এখনও কোন টিকিট বুক করা হয়নি।
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.bookingId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/95 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl overflow-hidden"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-lg font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] truncate">
                          বুকিং: {booking.bookingId}
                        </h5>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status === 'PENDING' && 'মুলতুবি'}
                          {booking.status === 'SUCCESSFUL' && 'সফল'}
                          {booking.status === 'FAILED' && 'ব্যর্থ'}
                          {booking.status === 'RefundPgr' && 'ফেরত প্রক্রিয়ায়'}
                          {booking.status === 'Refunded' && 'ফেরত হয়েছে'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-500">📅</span>
                          <div>
                            <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বুকিং সময়:</span>
                            <p className="text-gray-800 font-medium">{formatDateTime(booking.bookingTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-500">🚂</span>
                          <div>
                            <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">যাত্রার তারিখ:</span>
                            <p className="text-gray-800 font-medium">{formatDate(booking.travelDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Show ticket details if toggled */}
                      {showDetails[booking.bookingId] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          {loading[booking.bookingId] ? (
                            <div className="text-center py-8">
                              <motion.div
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <p className="text-blue-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">টিকিটের বিবরণ লোড হচ্ছে...</p>
                            </div>
                          ) : ticketDetails[booking.bookingId] ? (
                            <div id={`ticket-${booking.bookingId}`} className="bg-white border-2 border-blue-300 rounded-xl shadow-xl overflow-hidden">
                              {/* Single Consolidated Ticket */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                              >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                                  <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      বাংলাদেশ রেলওয়ে
                                    </h2>
                                    <p className="text-blue-100 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      ট্রেন টিকিট
                                    </p>
                                  </div>
                                </div>

                                {/* Ticket Content */}
                                <div className="p-6 space-y-6">
                                  {/* Booking ID and Barcode */}
                                  <div className="text-center border-b border-blue-200 pb-4">
                                    <p className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] mb-2">
                                      বুকিং আইডি
                                    </p>
                                    <p className="text-xl font-bold text-blue-800 font-mono mb-3">
                                      {ticketDetails[booking.bookingId][0]?.bookingId}
                                    </p>
                                    <div className="flex justify-center">
                                      <Barcode
                                        value={ticketDetails[booking.bookingId][0]?.bookingId || booking.bookingId}
                                        width={2}
                                        height={50}
                                        fontSize={14}
                                        background="#ffffff"
                                        lineColor="#000000"
                                      />
                                    </div>
                                  </div>

                                  {/* Primary Passenger Info */}
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-blue-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      বুকিং নিশ্চিতকারীর তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-blue-600 mb-1">নাম</p>
                                        <p className="font-semibold text-blue-900">{ticketDetails[booking.bookingId][0]?.fullName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-blue-600 mb-1">জাতীয় পরিচয়পত্র</p>
                                        <p className="font-semibold text-blue-900 font-mono">{ticketDetails[booking.bookingId][0]?.nid}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-blue-600 mb-1">ফোন নম্বর</p>
                                        <p className="font-semibold text-blue-900">{ticketDetails[booking.bookingId][0]?.phoneNum}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-blue-600 mb-1">ইমেইল</p>
                                        <p className="font-semibold text-blue-900">{ticketDetails[booking.bookingId][0]?.email}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Journey Details */}
                                  <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-green-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      যাত্রার বিবরণ
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-green-600 mb-1">ট্রেনের নাম</p>
                                        <p className="font-semibold text-green-900">{ticketDetails[booking.bookingId][0]?.trainName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-green-600 mb-1">শ্রেণী</p>
                                        <p className="font-semibold text-green-900">{ticketDetails[booking.bookingId][0]?.className}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-green-600 mb-1">যাত্রার তারিখ</p>
                                        <p className="font-semibold text-green-900">{ticketDetails[booking.bookingId][0]?.travelDate}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-green-600 mb-1">যাত্রার সময়</p>
                                        <p className="font-semibold text-green-900">{ticketDetails[booking.bookingId][0]?.travelTime}</p>
                                      </div>
                                    </div>

                                    {/* Route */}
                                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                      <div className="flex items-center justify-between">
                                        <div className="text-center">
                                          <p className="text-sm text-green-600 mb-1">যাত্রা শুরু</p>
                                          <p className="font-bold text-green-900">{ticketDetails[booking.bookingId][0]?.starting}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <div className="h-1 w-12 bg-green-300"></div>
                                          <span className="text-green-600 text-xl">🚂</span>
                                          <div className="h-1 w-12 bg-green-300"></div>
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-green-600 mb-1">গন্তব্য</p>
                                          <p className="font-bold text-green-900">{ticketDetails[booking.bookingId][0]?.destination}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Seat Information */}
                                  <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-purple-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      আসন তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm text-purple-600 mb-1">কোচ</p>
                                        <p className="font-semibold text-purple-900">{ticketDetails[booking.bookingId][0]?.coachName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-purple-600 mb-1">আসন নম্বর</p>
                                        <p className="font-semibold text-purple-900">{ticketDetails[booking.bookingId][0]?.seatNum}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-purple-600 mb-1">বার্থ</p>
                                        <p className="font-semibold text-purple-900">{ticketDetails[booking.bookingId][0]?.berthPosition || 'প্রযোজ্য নয়'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* All Passengers */}
                                  <div className="bg-yellow-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-yellow-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      সকল যাত্রী
                                    </h3>
                                    <div className="space-y-2">
                                      {ticketDetails[booking.bookingId][0]?.passengerName?.split(',').map((name, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white rounded px-3 py-2">
                                          <span className="font-medium text-yellow-900">{name.trim()}</span>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticketDetails[booking.bookingId][0]?.passengerType?.split(',')[idx]?.toUpperCase() === 'A'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {ticketDetails[booking.bookingId][0]?.passengerType?.split(',')[idx]?.toUpperCase() === 'A' ? 'প্রাপ্তবয়স্ক' : 'শিশু'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      পেমেন্ট তথ্য
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600 mb-1">মোট পেমেন্ট</p>
                                        <p className="font-bold text-gray-900 text-xl">৳{ticketDetails[booking.bookingId][0]?.total}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600 mb-1">ট্রানজেকশন আইডি</p>
                                        <p className="font-semibold text-gray-900 font-mono">{ticketDetails[booking.bookingId][0]?.trxId}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Footer */}
                                  <div className="text-center pt-4 border-t border-blue-200">
                                    <p className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      ভ্রমণের সময় এই টিকিট সাথে রাখুন
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      বাংলাদেশ রেলওয়ে - নিরাপদ ও আরামদায়ক যাত্রা
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                              <span className="text-yellow-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                এই বুকিং এর জন্য কোন টিকিটের বিবরণ পাওয়া যায়নি।
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-orange-200 p-4">
                      <div className="space-y-3">
                        <motion.button
                          onClick={() => toggleDetails(booking.bookingId)}
                          className="w-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-300 py-2 px-4 rounded-xl font-medium hover:from-orange-200 hover:to-red-200 transition-all duration-300"
                          disabled={loading[booking.bookingId]}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading[booking.bookingId] ? 'লোড হচ্ছে...' :
                            showDetails[booking.bookingId] ? 'বিবরণ লুকান' : 'বিবরণ দেখুন'}
                        </motion.button>

                        <div className="flex gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              {timeRemaining[booking.bookingId] && timeRemaining[booking.bookingId] !== "EXPIRED" && (
                                <div className="flex flex-col w-full">
                                  <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl mb-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        <strong>সময় বাকি:</strong>
                                      </span>
                                      <span className="bg-orange-800 text-white px-3 py-1 rounded-full text-sm font-bold">{timeRemaining[booking.bookingId]}</span>
                                    </div>
                                  </div>
                                  <motion.button
                                    onClick={() => navigate(`/booking/stationMaster/${booking.bookingId}`)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    বুকিং সম্পন্ন করুন
                                  </motion.button>
                                </div>
                              )}
                              {(!timeRemaining[booking.bookingId] || timeRemaining[booking.bookingId] === "EXPIRED") && (
                                <div className="w-full text-center">
                                  <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl">
                                    <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                      বুকিং এর সময় শেষ
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {booking.status === 'SUCCESSFUL' && (
                            <>
                              {refundEligibility[booking.bookingId]?.eligible ? (
                                <motion.button
                                  onClick={() => handleRefund(booking.bookingId)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex-1"
                                  disabled={loading[`refund_${booking.bookingId}`]}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {loading[`refund_${booking.bookingId}`] ? 'প্রক্রিয়াকরণ...' : 
                                   `ফেরত অনুরোধ (৳${refundEligibility[booking.bookingId]?.estimatedRefund || 0})`}
                                </motion.button>
                              ) : (
                                <button
                                  className="bg-gray-400 text-gray-600 py-2 px-4 rounded-xl font-medium flex-1 cursor-not-allowed"
                                  disabled
                                  title={refundEligibility[booking.bookingId]?.message || "Checking eligibility..."}
                                >
                                  ফেরতযোগ্য নয়
                                </button>
                              )}
                              <motion.button
                                onClick={() => downloadTicketPDF(booking.bookingId)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex-1"
                                disabled={!showDetails[booking.bookingId] || !ticketDetails[booking.bookingId]}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                টিকিট ডাউনলোড
                              </motion.button>
                            </>
                          )}

                          {booking.status === 'RefundPgr' && (
                            <div className="w-full bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-xl text-center">
                              <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                <strong>ফেরত প্রক্রিয়ায়</strong>
                                {refundStatus[booking.bookingId] && (
                                  <div>পরিমাণ: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                                )}
                              </span>
                            </div>
                          )}

                          {booking.status === 'Refunded' && (
                            <div className="w-full bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-center">
                              <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                <strong>ফেরত হয়েছে</strong>
                                {refundStatus[booking.bookingId] && (
                                  <div>পরিমাণ: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                                )}
                              </span>
                            </div>
                          )}

                          {booking.status === 'FAILED' && (
                            <div className="w-full bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-center">
                              <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                <strong>বুকিং ব্যর্থ</strong>
                                <div>কোন পদক্ষেপ উপলব্ধ নেই</div>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h5 className="text-xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  ⚠️ ফেরত নিশ্চিতকরণ
                </h5>
                <button 
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedBookingForRefund(null);
                  }}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <span style={{ fontSize: '3rem' }}>💰</span>
                </div>
                <h6 className="text-gray-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                  আপনি কি নিশ্চিত যে এই বুকিং এর জন্য ফেরত অনুরোধ করতে চান?
                </h6>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">বুকিং আইডি:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">{selectedBookingForRefund}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ফেরত পরিমাণ:</span>
                    <span className="text-green-600 font-bold">
                      {loadingRefundAmount ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        `৳${refundAmount}`
                      )}
                    </span>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    ⚠️ <strong>গুরুত্বপূর্ণ:</strong> এই কার্যটি পূর্বাবস্থায় ফেরানো যাবে না। একবার নিশ্চিত করলে,
                    ফেরত অনুরোধ প্রক্রিয়া করা হবে এবং আপনার বুকিং বাতিল হয়ে যাবে।
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                    ℹ️ ফেরত পরিমাণ আমাদের বাতিলকরণ নীতি এবং প্রস্থানের সময় অবশিষ্ট সময়ের উপর ভিত্তি করে গণনা করা হয়।
                    ফেরত ৫-৭ কার্যদিবসের মধ্যে প্রক্রিয়া করা হবে।
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <motion.button 
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedBookingForRefund(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ❌ বাতিল
              </motion.button>
              <motion.button 
                onClick={confirmRefund}
                disabled={loading[`refund_${selectedBookingForRefund}`] || loadingRefundAmount || refundAmount === 0}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading[`refund_${selectedBookingForRefund}`] || loadingRefundAmount ? 1 : 1.02 }}
                whileTap={{ scale: loading[`refund_${selectedBookingForRefund}`] || loadingRefundAmount ? 1 : 0.98 }}
              >
                {loading[`refund_${selectedBookingForRefund}`] ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    প্রক্রিয়াকরণ...
                  </>
                ) : loadingRefundAmount ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    গণনা করা হচ্ছে...
                  </>
                ) : (
                  <>
                    ✅ ফেরত নিশ্চিত করুন (৳{refundAmount})
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`min-w-80 max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
              notification.type === 'error' ? 'bg-red-100/90 border-red-300 text-red-800' :
              notification.type === 'success' ? 'bg-green-100/90 border-green-300 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-100/90 border-yellow-300 text-yellow-800' : 
              'bg-blue-100/90 border-blue-300 text-blue-800'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
              </div>
              <div className="flex-grow-1 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                {notification.message}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default MyBookingsStationMaster;