import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navBar";
import api from "../api";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyBookingsStationMaster() {
  const navigate = useNavigate();
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
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your bookings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4 text-dark">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted display-6">No bookings found</div>
            <p className="text-muted mt-2">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="row">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  {/* Card Header */}
                  <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0 text-truncate">{booking.bookingId}</h5>
                      <span className={`badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="card-text mb-1">
                        <strong>Booking Time:</strong><br />
                        <small className="text-muted">{formatDateTime(booking.bookingTime)}</small>
                      </p>
                      <p className="card-text mb-1">
                        <strong>Travel Date:</strong><br />
                        <small className="text-muted">{formatDate(booking.travelDate)}</small>
                      </p>
                    </div>
                    
                    {/* Show ticket details if toggled */}
                    {showDetails[booking.bookingId] && (
                      <div className="mt-3">
                        {loading[booking.bookingId] ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="small text-muted mt-2">Loading ticket details...</p>
                          </div>
                        ) : ticketDetails[booking.bookingId] ? (
                          <div id={`ticket-${booking.bookingId}`}>
                            {ticketDetails[booking.bookingId].map((ticket, index) => (
                              <div key={index} className="border rounded p-3 mb-3 bg-light">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <h6 className="text-primary mb-0">{ticket.trainName} - {ticket.className}</h6>
                                  {ticket.bookingId && (
                                    <div className="text-center">
                                      <Barcode value={ticket.bookingId} width={1} height={30} fontSize={10} />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="row">
                                  <div className="col-md-8">
                                    <div className="mb-2">
                                      <h6 className="text-dark mb-1">Passenger Details</h6>
                                      <p className="small mb-1"><strong>Name:</strong> {ticket.fullName}</p>
                                      <p className="small mb-1"><strong>NID:</strong> {ticket.nid}</p>
                                      <p className="small mb-1"><strong>Phone:</strong> {ticket.phoneNum}</p>
                                      <p className="small mb-1"><strong>Email:</strong> {ticket.email}</p>
                                    </div>
                                    
                                    <div className="mb-2">
                                      <h6 className="text-dark mb-1">Travel Info</h6>
                                      <p className="small mb-1"><strong>Date:</strong> {ticket.travelDate}</p>
                                      <p className="small mb-1"><strong>Time:</strong> {ticket.travelTime}</p>
                                      <p className="small mb-1"><strong>From:</strong> {ticket.starting}</p>
                                      <p className="small mb-1"><strong>To:</strong> {ticket.destination}</p>
                                    </div>
                                    
                                    <div className="mb-2">
                                      <h6 className="text-dark mb-1">Passenger List</h6>
                                      <ul className="list-unstyled mb-0">
                                        {ticket.passengerName?.split(',').map((name, idx) => (
                                          <li key={idx} className="small">
                                            {name.trim()} - {ticket.passengerType?.split(',')[idx]?.toUpperCase() === 'A' ? 'Adult' : 'Child'}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <p className="small mb-1"><strong>Seats:</strong> {ticket.coachName}-{ticket.seatNum}</p>
                                    <p className="small mb-1"><strong>Berth Position:</strong> {ticket.berthPosition || 'N/A'}</p>
                                    <p className="small mb-1"><strong>Total Paid:</strong> ৳ {ticket.total}</p>
                                    <p className="small mb-0"><strong>Transaction ID:</strong> {ticket.trxId}</p>
                                  </div>
                                  
                                  {/* Only show profile image for non-station master users and when image exists */}
                                  {localStorage.getItem('userRole') !== 'STATION_MASTER' && ticket.profileImage && (
                                    <div className="col-md-4 text-center">
                                      <img 
                                        src={`data:image/jpeg;base64,${ticket.profileImage}`} 
                                        alt="Profile" 
                                        className="img-thumbnail mb-2" 
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="alert alert-warning" role="alert">
                            <small>No ticket details available for this booking.</small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer bg-transparent">
                    <div className="d-grid gap-2">
                      <button
                        onClick={() => toggleDetails(booking.bookingId)}
                        className="btn btn-outline-primary btn-sm"
                        disabled={loading[booking.bookingId]}
                      >
                        {loading[booking.bookingId] ? 'Loading...' : 
                         showDetails[booking.bookingId] ? 'Hide Details' : 'Show Details'}
                      </button>
                      
                      <div className="d-flex gap-2">
                        {booking.status === 'PENDING' && (
                          <>
                            {timeRemaining[booking.bookingId] && timeRemaining[booking.bookingId] !== "EXPIRED" && (
                              <div className="d-flex flex-column align-items-start w-100">
                                <div className="alert alert-warning mb-2 w-100" role="alert">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <i className="fas fa-clock me-2"></i>
                                      <strong>Complete booking within:</strong>
                                    </div>
                                    <span className="badge bg-dark fs-6">{timeRemaining[booking.bookingId]}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate(`/booking/${booking.bookingId}`)}
                                  className="btn btn-primary btn-sm flex-fill"
                                >
                                  Complete Booking
                                </button>
                              </div>
                            )}
                            {(!timeRemaining[booking.bookingId] || timeRemaining[booking.bookingId] === "EXPIRED") && (
                              <div className="text-center w-100">
                                <div className="alert alert-danger mb-2" role="alert">
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  Booking time expired
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {booking.status === 'SUCCESSFUL' && (
                          <>
                            {refundEligibility[booking.bookingId]?.eligible ? (
                              <button
                                onClick={() => handleRefund(booking.bookingId)}
                                className="btn btn-danger btn-sm flex-fill"
                                disabled={loading[`refund_${booking.bookingId}`]}
                              >
                                {loading[`refund_${booking.bookingId}`] ? 'Processing...' : 
                                 `Request Refund (৳${refundEligibility[booking.bookingId]?.estimatedRefund || 0})`}
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm flex-fill"
                                disabled
                                title={refundEligibility[booking.bookingId]?.message || "Checking eligibility..."}
                              >
                                Non-refundable
                              </button>
                            )}
                            <button
                              onClick={() => downloadTicketPDF(booking.bookingId)}
                              className="btn btn-info btn-sm flex-fill"
                              disabled={!showDetails[booking.bookingId] || !ticketDetails[booking.bookingId]}
                            >
                              Download Ticket
                            </button>
                          </>
                        )}

                        {booking.status === 'RefundPgr' && (
                          <div className="alert alert-info mb-0 py-2 text-center">
                            <small>
                              <strong>Refund in Progress</strong>
                              {refundStatus[booking.bookingId] && (
                                <div>Amount: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                              )}
                            </small>
                          </div>
                        )}

                        {booking.status === 'Refunded' && (
                          <div className="alert alert-success mb-0 py-2 text-center">
                            <small>
                              <strong>Refunded</strong>
                              {refundStatus[booking.bookingId] && (
                                <div>Amount: ৳{refundStatus[booking.bookingId].refundAmount}</div>
                              )}
                            </small>
                          </div>
                        )}

                        {booking.status === 'FAILED' && (
                          <div className="alert alert-danger mb-0 py-2 text-center">
                            <small>
                              <i className="fas fa-times-circle me-2"></i>
                              <strong>Booking Failed</strong>
                              <div>No action available</div>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  ⚠️ Confirm Refund Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedBookingForRefund(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span style={{ fontSize: '3rem' }}>💰</span>
                  </div>
                  <h6 className="text-dark mb-3">Are you sure you want to request a refund for this booking?</h6>
                  <div className="alert alert-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <span><strong>Booking ID:</strong></span>
                      <span className="badge bg-primary">{selectedBookingForRefund}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span><strong>Refund Amount:</strong></span>
                      <span className="text-success fw-bold">
                        {loadingRefundAmount ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          `৳${refundAmount}`
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="alert alert-danger">
                    <small>
                      ⚠️ <strong>Important:</strong> This action cannot be undone. Once you confirm, 
                      the refund request will be processed and your booking will be cancelled.
                    </small>
                  </div>
                  <div className="alert alert-warning">
                    <small>
                      ℹ️ The refund amount is calculated based on our cancellation policy and the time remaining 
                      until departure. The refund will be processed within 5-7 business days.
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedBookingForRefund(null);
                  }}
                >
                  ❌ Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmRefund}
                  disabled={loading[`refund_${selectedBookingForRefund}`] || loadingRefundAmount || refundAmount === 0}
                >
                  {loading[`refund_${selectedBookingForRefund}`] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : loadingRefundAmount ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Calculating...
                    </>
                  ) : (
                    <>
                      ✅ Confirm Refund (৳{refundAmount})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Container */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`alert alert-${
              notification.type === 'error' ? 'danger' :
              notification.type === 'success' ? 'success' :
              notification.type === 'warning' ? 'warning' : 'info'
            } alert-dismissible fade show shadow-sm mb-2 notification-slide-in`}
            role="alert"
            style={{ 
              minWidth: '300px',
              maxWidth: '400px'
            }}
          >
            <div className="d-flex align-items-start">
              <div className="me-2">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
              </div>
              <div className="flex-grow-1">
                {notification.message}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .notification-slide-in {
            animation: slideInRight 0.3s ease-out;
          }
        `
      }} />
    </>
  );
}

export default MyBookingsStationMaster;