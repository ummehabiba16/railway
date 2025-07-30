import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./navBar";
import api from "../api";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';

function MyBookings() {
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
    const [refundStatusMessages, setRefundStatusMessages] = useState({});
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
            const response = await api.post("/ticket/booking", { bookingId });
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

    const handlePayNow = async (bookingId) => {
        try {
            console.log(`Processing payment for booking: ${bookingId}`);
            showInfo(`Redirecting to payment for booking: ${bookingId}`);
        } catch (error) {
            console.error("Error processing payment:", error);
            showError("Error processing payment. Please try again.");
        }
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
                refundRemarks: "Customer requested refund"
            };

            const response = await api.post("/refund/initiate", refundRequest);

            if (response.status === 200) {
                const result = response.data;
                if (result.status === 'success') {
                    showSuccess(`Refund initiated successfully! Refund amount: ৳${result.refundAmount}. Reference ID: ${result.refundRefId}`);
                    // Update the booking status locally
                    setBooking(prevBookings =>
                        prevBookings.map(booking =>
                            booking.bookingId === bookingId
                                ? { ...booking, status: 'RefundPgr' }
                                : booking
                        )
                    );
                    // Start checking refund status
                    checkRefundStatus(bookingId);
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
            // Check if we already have recent status data (within last 30 seconds)
            const lastChecked = refundStatus[bookingId]?.lastChecked;
            if (lastChecked && (Date.now() - lastChecked < 30000)) {
                return; // Skip if checked recently
            }

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
                                [bookingId]: {
                                    ...prev[bookingId],
                                    refundStatus: 'Completed',
                                    lastChecked: Date.now()
                                }
                            }));

                            showSuccess(`ফেরত সম্পন্ন! পরিমাণ: ৳${refundStatus[bookingId].refundAmount}`);
                        } else if (statusData.status === 'processing') {
                            setRefundStatus(prev => ({
                                ...prev,
                                [bookingId]: {
                                    ...prev[bookingId],
                                    lastChecked: Date.now()
                                }
                            }));
                        } else {
                            setRefundStatus(prev => ({
                                ...prev,
                                [bookingId]: {
                                    ...prev[bookingId],
                                    lastChecked: Date.now()
                                }
                            }));
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
                    [bookingId]: {
                        ...refund,
                        lastChecked: Date.now()
                    }
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
                                    [bookingId]: {
                                        ...refund,
                                        refundStatus: 'Completed',
                                        lastChecked: Date.now()
                                    }
                                }));

                                showSuccess(`ফেরত সম্পন্ন! পরিমাণ: ৳${refund.refundAmount}`);
                            }
                        }
                    } catch (statusError) {
                        console.error("Error checking refund status with SSLCommerz:", statusError);
                    }
                }
            }
        } catch (error) {
            console.error("Error getting refund details:", error);
        }
    };

    // Direct status check for manual user clicks - more efficient
    const handleCheckRefundStatus = async (bookingId) => {
        try {
            setLoading(prev => ({ ...prev, [`status_${bookingId}`]: true }));
            setRefundStatusMessages(prev => ({ ...prev, [bookingId]: null })); // Clear previous message

            if (refundStatus[bookingId] && refundStatus[bookingId].refundRefId) {
                const refundRefId = refundStatus[bookingId].refundRefId;
                console.log(`Manual status check with refundRefId: ${refundRefId}`);

                const statusResponse = await api.get(`/refund/status?refundRefId=${refundRefId}`);
                if (statusResponse.status === 200) {
                    const statusData = statusResponse.data;

                    if (statusData.status === 'refunded') {
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

                        setRefundStatusMessages(prev => ({
                            ...prev,
                            [bookingId]: {
                                type: 'success',
                                message: `✅ ফেরত সম্পন্ন! পরিমাণ: ৳${refundStatus[bookingId].refundAmount} প্রক্রিয়া করা হয়েছে।`
                            }
                        }));
                    } else if (statusData.status === 'processing') {
                        setRefundStatusMessages(prev => ({
                            ...prev,
                            [bookingId]: {
                                type: 'info',
                                message: '🔄 ফেরত এখনও প্রক্রিয়াধীন। দয়া করে পরে আবার চেক করুন।'
                            }
                        }));
                    } else if (statusData.status === 'failed') {
                        setRefundStatusMessages(prev => ({
                            ...prev,
                            [bookingId]: {
                                type: 'error',
                                message: '❌ ফেরত প্রক্রিয়া ব্যর্থ। দয়া করে সাপোর্টের সাথে যোগাযোগ করুন।'
                            }
                        }));
                    } else {
                        setRefundStatusMessages(prev => ({
                            ...prev,
                            [bookingId]: {
                                type: 'info',
                                message: `ℹ️ ফেরত স্ট্যাটাস: ${statusData.status}`
                            }
                        }));
                    }
                }
            } else {
                // If no refundRefId, check if we have basic refund info
                if (refundStatus[bookingId]) {
                    const refundInfo = refundStatus[bookingId];
                    setRefundStatusMessages(prev => ({
                        ...prev,
                        [bookingId]: {
                            type: 'info',
                            message: `🔄 ফেরত প্রক্রিয়াধীন। পরিমাণ: ৳${refundInfo.refundAmount || 'N/A'}`
                        }
                    }));
                } else {
                    // Fall back to the original method and get fresh data
                    await checkRefundStatus(bookingId);
                    setRefundStatusMessages(prev => ({
                        ...prev,
                        [bookingId]: {
                            type: 'warning',
                            message: '⚠️ ফেরত তথ্য খুঁজে পাওয়া যায়নি। দয়া করে পরে আবার চেষ্টা করুন।'
                        }
                    }));
                }
            }
        } catch (error) {
            console.error("Error checking refund status:", error);
            setRefundStatusMessages(prev => ({
                ...prev,
                [bookingId]: {
                    type: 'error',
                    message: 'ফেরত স্ট্যাটাস চেক করতে ব্যর্থ। দয়া করে আবার চেষ্টা করুন।'
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [`status_${bookingId}`]: false }));
        }
    };

    const downloadTicketPDF = async (bookingId) => {
        try {
            showInfo('PDF তৈরি করা হচ্ছে...');

            // Fetch ticket details if not already available
            let ticketData = ticketDetails[bookingId];
            if (!ticketData) {
                console.log('Fetching ticket details for download...');
                const response = await api.post("/ticket/booking", { bookingId });
                ticketData = response.data;
            }

            if (!ticketData || ticketData.length === 0) {
                showError('টিকিট ডেটা পাওয়া যায়নি।');
                return;
            }

            // Create a temporary ticket element for PDF generation - exact PaymentSuccess format
            const tempTicketDiv = document.createElement('div');
            tempTicketDiv.style.position = 'absolute';
            tempTicketDiv.style.left = '-9999px';
            tempTicketDiv.style.width = '1000px';
            tempTicketDiv.style.backgroundColor = '#ffffff';
            tempTicketDiv.style.fontFamily = "'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif";

            tempTicketDiv.innerHTML = `
                <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); margin-bottom: 32px; overflow: hidden; border: 2px solid #e5e7eb;">
                    <!-- Ticket Header -->
                    <div style="background: linear-gradient(to right, #f97316, #ef4444); color: white; padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 4px 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    বাংলাদেশ রেলওয়ে
                                </h2>
                                <p style="color: #fed7aa; margin: 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    ই-টিকিট (নিশ্চিত)
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 14px; color: #fed7aa; margin: 0 0 4px 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    বুকিং আইডি
                                </p>
                                <p style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">${ticketData[0].bookingId}</p>
                                <div style="background: white; padding: 8px; border-radius: 8px; display: inline-block;">
                                    <div style="font-family: monospace; font-size: 10px; letter-spacing: 1px; color: #000; text-align: center;">
                                        ||||| ${ticketData[0].bookingId} |||||
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ticket Body -->
                    <div style="padding: 24px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px;">
                            <!-- Primary Passenger Photo and Details -->
                            <div>
                                <div style="text-align: center; margin-bottom: 16px;">
                                    <div style="width: 128px; height: 160px; margin: 0 auto 12px auto; background: linear-gradient(to bottom, #f3f4f6, #e5e7eb); border: 2px solid #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <div style="width: 100%; height: 100%; background: linear-gradient(to bottom, #f3f4f6, #e5e7eb); display: flex; align-items: center; justify-content: center;">
                                            <svg style="width: 64px; height: 64px; color: #9ca3af;" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p style="font-size: 12px; color: #6b7280; margin: 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                        প্রাথমিক যাত্রীর ছবি
                                    </p>
                                </div>

                                <div style="text-align: center;">
                                    <h3 style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0 0 8px 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                        প্রাথমিক যাত্রী
                                    </h3>
                                    <p style="color: #374151; font-weight: 500; margin: 0 0 4px 0;">
                                        ${ticketData[0].fullName}
                                    </p>
                                    <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">
                                        NID: ${ticketData[0].nid}
                                    </p>
                                    <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">
                                        ফোন: ${ticketData[0].phoneNum}
                                    </p>
                                    <p style="font-size: 14px; color: #6b7280; margin: 0;">
                                        ইমেইল: ${ticketData[0].email}
                                    </p>
                                </div>
                            </div>

                            <!-- Journey Details -->
                            <div>
                                <h3 style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0 0 16px 0; text-align: center; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    যাত্রার বিবরণ
                                </h3>

                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">ট্রেন:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].trainName}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">তারিখ:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].travelDate}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">সময়:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].travelTime}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">থেকে:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].starting}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">গন্তব্য:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].destination}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                        <span style="font-size: 14px; color: #6b7280; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">শ্রেণী:</span>
                                        <span style="font-weight: 500; color: #1f2937;">${ticketData[0].className}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- All Passengers List and Seat Details -->
                            <div>
                                <h3 style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0 0 16px 0; text-align: center; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    সকল যাত্রী তালিকা
                                </h3>

                                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                                    ${ticketData.map((ticket, ticketIndex) => {
                const passengerNames = ticket.passengerName?.split(',') || [];
                const passengerTypes = ticket.passengerType?.split(',') || [];
                const seatNumbers = ticket.seatNum?.toString().includes(',') ? ticket.seatNum.split(',') : [ticket.seatNum];

                return passengerNames.map((name, nameIndex) => `
                                            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb;">
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                    <span style="font-size: 14px; font-weight: 500; color: #ea580c; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                                        যাত্রী ${ticketIndex * passengerNames.length + nameIndex + 1}
                                                    </span>
                                                    <span style="font-size: 12px; background: #fed7aa; color: #ea580c; padding: 2px 8px; border-radius: 12px;">
                                                        আসন ${seatNumbers[nameIndex] || ticket.seatNum}
                                                    </span>
                                                </div>
                                                <p style="font-size: 14px; font-weight: 500; color: #1f2937; margin: 0 0 4px 0;">
                                                    ${name.trim()}
                                                </p>
                                                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
                                                    <span style="font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                                        ${passengerTypes[nameIndex]?.toUpperCase() === 'A' ? 'প্রাপ্তবয়স্ক' : 'শিশু'}
                                                    </span>
                                                    <span>কোচ: ${ticket.coachName}</span>
                                                </div>
                                            </div>
                                        `).join('');
            }).join('')}
                                </div>

                                <!-- Payment Details -->
                                <div style="margin-top: 16px; padding: 12px; background: #fef3e2; border-radius: 8px; border: 1px solid #fed7aa;">
                                    <div style="margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 14px; font-weight: 500; color: #ea580c; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                                মোট পেমেন্ট
                                            </span>
                                            <span style="font-size: 18px; font-weight: bold; color: #ea580c;">
                                                ৳${ticketData[0].total}
                                            </span>
                                        </div>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
                                        <span style="font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                            ট্রানজেকশন আইডি
                                        </span>
                                        <span>${ticketData[0].trxId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ticket Footer -->
                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                                <span style="font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    ইস্যুর তারিখ: ${new Date().toLocaleDateString('bn-BD')}
                                </span>
                                <span>
                                    Bangladesh Railway E-Ticket System (CONFIRMED)
                                </span>
                            </div>
                            <div style="text-align: center;">
                                <p style="font-size: 12px; color: #6b7280; margin: 0; font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', serif;">
                                    এই টিকিট যাত্রার সময় অবশ্যই সাথে রাখুন। ভ্রমণের আগে আপনার পরিচয়পত্র নিশ্চিত করুন।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(tempTicketDiv);

            // Generate PDF with exact PaymentSuccess settings
            html2canvas(tempTicketDiv, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 15000,
                removeContainer: true,
                logging: false,
                width: 1000,
                height: tempTicketDiv.scrollHeight
            }).then((canvas) => {
                try {
                    console.log('Canvas created successfully');
                    const imgData = canvas.toDataURL('image/png', 1.0);

                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const canvasAspectRatio = canvas.width / canvas.height;
                    const pdfAspectRatio = pdfWidth / pdfHeight;

                    let imgWidth, imgHeight, xOffset = 0, yOffset = 0;

                    if (canvasAspectRatio > pdfAspectRatio) {
                        imgWidth = pdfWidth;
                        imgHeight = pdfWidth / canvasAspectRatio;
                        yOffset = (pdfHeight - imgHeight) / 2;
                    } else {
                        imgHeight = pdfHeight;
                        imgWidth = pdfHeight * canvasAspectRatio;
                        xOffset = (pdfWidth - imgWidth) / 2;
                    }

                    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, '', 'FAST');
                    pdf.save(`railway-ticket-${bookingId}.pdf`);
                    showSuccess('টিকিট সফলভাবে ডাউনলোড হয়েছে!');
                    console.log('PDF saved successfully');
                } catch (pdfError) {
                    console.error('Error creating PDF:', pdfError);
                    showError('PDF তৈরি করতে ব্যর্থ। দয়া করে আবার চেষ্টা করুন।');
                } finally {
                    // Clean up
                    document.body.removeChild(tempTicketDiv);
                }
            }).catch((error) => {
                console.error('Error generating canvas:', error);
                showError('টিকিট প্রক্রিয়া করতে ব্যর্থ। দয়া করে আবার চেষ্টা করুন।');
                document.body.removeChild(tempTicketDiv);
            });

        } catch (error) {
            console.error('Error in downloadTicketPDF:', error);
            showError('টিকিট ডাউনলোড করতে ব্যর্থ। দয়া করে আবার চেষ্টা করুন।');
        }
    }; const formatDate = (dateString) => {
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
                return 'bg-warning text-dark';
            case 'SUCCESSFUL':
                return 'bg-success text-white';
            case 'FAILED':
                return 'bg-danger text-white';
            case 'RefundPgr':
                return 'bg-info text-white';
            case 'Refunded':
                return 'bg-primary text-white';
            default:
                return 'bg-secondary text-white';
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
                                আপনার বুকিং লোড হচ্ছে...
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
                                আমার বুকিং সমূহ
                            </h1>
                            <p className="text-blue-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                আপনার সকল ট্রেনের টিকিট বুকিং এর তালিকা
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
                                    আপনি এখনও কোন টিকিট বুক করেননি।
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
                                                                            প্রধান যাত্রীর তথ্য
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
                                        <div className="border-t border-orange-200 pt-4">
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
                                                                        onClick={() => navigate(`/booking/${booking.bookingId}`)}
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
                                                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                                                                    disabled={loading[`refund_${booking.bookingId}`]}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                >
                                                                    {loading[`refund_${booking.bookingId}`] ? 'প্রক্রিয়াকরণ...' :
                                                                        `রিফান্ড(৳${refundEligibility[booking.bookingId]?.estimatedRefund || 0})`}
                                                                </motion.button>
                                                            ) : (
                                                                <button
                                                                    className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-xl font-medium cursor-not-allowed"
                                                                    disabled
                                                                    title={refundEligibility[booking.bookingId]?.message || "যোগ্যতা পরীক্ষা করা হচ্ছে..."}
                                                                >
                                                                    ফেরতযোগ্য নয়
                                                                </button>
                                                            )}
                                                            <motion.button
                                                                onClick={() => downloadTicketPDF(booking.bookingId)}
                                                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                টিকিট ডাউনলোড
                                                            </motion.button>
                                                        </>
                                                    )}

                                                    {booking.status === 'RefundPgr' && (
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-xl text-center">
                                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>ফেরত প্রক্রিয়াধীন</strong>
                                                                    {refundStatus[booking.bookingId] && (
                                                                        <div>পরিমাণ: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <motion.button
                                                                onClick={() => handleCheckRefundStatus(booking.bookingId)}
                                                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                                                                disabled={loading[`status_${booking.bookingId}`]}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                {loading[`status_${booking.bookingId}`] ? (
                                                                    <>
                                                                        <motion.span
                                                                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                                                            animate={{ rotate: 360 }}
                                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                        />
                                                                        পরীক্ষা করা হচ্ছে...
                                                                    </>
                                                                ) : (
                                                                    'স্ট্যাটাস চেক করুন'
                                                                )}
                                                            </motion.button>

                                                            {/* Status Message Display */}
                                                            {refundStatusMessages[booking.bookingId] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className={`px-4 py-3 rounded-xl text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif] ${refundStatusMessages[booking.bookingId].type === 'success'
                                                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                                                        : refundStatusMessages[booking.bookingId].type === 'error'
                                                                            ? 'bg-red-100 border border-red-300 text-red-800'
                                                                            : refundStatusMessages[booking.bookingId].type === 'warning'
                                                                                ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                                                                                : 'bg-blue-100 border border-blue-300 text-blue-800'
                                                                        }`}
                                                                >
                                                                    {refundStatusMessages[booking.bookingId].message}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {booking.status === 'Refunded' && (
                                                        <div className="w-full">
                                                            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-center">
                                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>ফেরত সম্পন্ন</strong>
                                                                    {refundStatus[booking.bookingId] && (
                                                                        <div>পরিমাণ: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {booking.status === 'FAILED' && (
                                                        <div className="w-full">
                                                            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-center">
                                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    <strong>বুকিং ব্যর্থ</strong>
                                                                    <div>কোন কার্যক্রম উপলব্ধ নেই</div>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div >

                    {/* Refund Confirmation Modal */}
                    {
                        showRefundModal && (
                            <motion.div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                >
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                ⚠️ ফেরত নিশ্চিতকরণ
                                            </h5>
                                            <motion.button
                                                onClick={() => {
                                                    setShowRefundModal(false);
                                                    setSelectedBookingForRefund(null);
                                                }}
                                                className="text-white hover:text-red-200 text-2xl"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                ×
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl">💰</span>
                                            </div>
                                            <h6 className="text-gray-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                আপনি কি নিশ্চিত যে এই বুকিং এর জন্য ফেরত চান?
                                            </h6>

                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="text-center">
                                                        <span className="font-semibold text-gray-600">বুকিং আইডি:</span>
                                                        <p className="bg-orange-800 text-white px-3 py-1 rounded-full text-xs font-mono mt-1">
                                                            {selectedBookingForRefund}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="font-semibold text-gray-600">ফেরত পরিমাণ:</span>
                                                        <p className="text-green-600 font-bold mt-1">
                                                            {loadingRefundAmount ? (
                                                                <motion.span
                                                                    className="inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                />
                                                            ) : (
                                                                `৳${refundAmount}`
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                                <p className="text-red-800 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    ⚠️ <strong>গুরুত্বপূর্ণ:</strong> এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। একবার নিশ্চিত করলে,
                                                    ফেরত অনুরোধ প্রক্রিয়া করা হবে এবং আপনার বুকিং বাতিল হবে।
                                                </p>
                                            </div>

                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                <p className="text-yellow-800 text-sm font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    ℹ️ ফেরত পরিমাণ আমাদের বাতিলকরণ নীতি এবং যাত্রার জন্য বাকি সময়ের উপর ভিত্তি করে
                                                    গণনা করা হয়। ফেরত ৫-৭ কার্যদিবসের মধ্যে প্রক্রিয়া করা হবে।
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0">
                                        <div className="flex gap-3">
                                            <motion.button
                                                onClick={() => {
                                                    setShowRefundModal(false);
                                                    setSelectedBookingForRefund(null);
                                                }}
                                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                ❌ বাতিল
                                            </motion.button>
                                            <motion.button
                                                onClick={confirmRefund}
                                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                                                disabled={loading[`refund_${selectedBookingForRefund}`] || loadingRefundAmount || refundAmount === 0}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {loading[`refund_${selectedBookingForRefund}`] ? (
                                                    <>
                                                        <motion.span
                                                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        প্রক্রিয়াকরণ...
                                                    </>
                                                ) : loadingRefundAmount ? (
                                                    <>
                                                        <motion.span
                                                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        />
                                                        গণনা করা হচ্ছে...
                                                    </>
                                                ) : (
                                                    `✅ ফেরত নিশ্চিত করুন (৳${refundAmount})`
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )
                    }

                    {/* Notifications Container */}
                    <div className="fixed top-4 right-4 z-50 space-y-3">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                className={`max-w-md w-full bg-white border-l-4 rounded-lg shadow-lg ${notification.type === 'error' ? 'border-red-500' :
                                    notification.type === 'success' ? 'border-green-500' :
                                        notification.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                                    }`}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="p-4">
                                    <div className="flex items-start">
                                        <div className={`mr-3 text-xl ${notification.type === 'error' ? 'text-red-500' :
                                            notification.type === 'success' ? 'text-green-500' :
                                                notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                            }`}>
                                            {notification.type === 'success' && '✅'}
                                            {notification.type === 'error' && '❌'}
                                            {notification.type === 'warning' && '⚠️'}
                                            {notification.type === 'info' && 'ℹ️'}
                                        </div>
                                        <div className="flex-grow text-gray-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            {notification.message}
                                        </div>
                                        <motion.button
                                            onClick={() => removeNotification(notification.id)}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            ×
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </main >
            </div >
        </>
    );
}

export default MyBookings;