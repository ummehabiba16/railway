import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import Navbar from "./navBar";
import api from "../api";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyBookings() {
  const [bookings, setBooking] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [ticketDetails, setTicketDetails] = useState({});
  const [loading, setLoading] = useState({});
  const ticketRef = useRef();

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
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

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
      alert(`Redirecting to payment for booking: ${bookingId}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    }
  };

  const handleRefund = async (bookingId) => {
    try {
      console.log(`Processing refund for booking: ${bookingId}`);
      const confirmRefund = window.confirm("Are you sure you want to request a refund for this booking?");
      
      if (confirmRefund) {
        alert(`Refund requested for booking: ${bookingId}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Error processing refund. Please try again.");
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
                                  
                                  <div className="col-md-4 text-center">
                                    {ticket.profileImage ? (
                                      <img 
                                        src={`data:image/jpeg;base64,${ticket.profileImage}`} 
                                        alt="Profile" 
                                        className="img-thumbnail mb-2" 
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <img 
                                        src="https://via.placeholder.com/100" 
                                        alt="No Profile" 
                                        className="img-thumbnail mb-2"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                      />
                                    )}
                                  </div>
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
                          <button
                            onClick={() => handlePayNow(booking.bookingId)}
                            className="btn btn-success btn-sm flex-fill"
                          >
                            Pay Now
                          </button>
                        )}
                        
                        {booking.status === 'SUCCESSFUL' && (
                          <>
                            <button
                              onClick={() => handleRefund(booking.bookingId)}
                              className="btn btn-danger btn-sm flex-fill"
                            >
                              Request Refund
                            </button>
                            <button
                              onClick={() => downloadTicketPDF(booking.bookingId)}
                              className="btn btn-info btn-sm flex-fill"
                              disabled={!showDetails[booking.bookingId] || !ticketDetails[booking.bookingId]}
                            >
                              Download Ticket
                            </button>
                          </>
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
    </>
  );
}

export default MyBookings;