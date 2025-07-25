import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // your axios instance
import Navbar from "../components/navBar";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [userTypeInfo, setUserTypeInfo] = useState(null);
  const [holdTime, setHoldTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
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
        newErrors[`${index}_passengerName`] = "Passenger name is required";
      }
      if (!passenger.passengerType) {
        newErrors[`${index}_passengerType`] = "Passenger type is required";
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
      // Handle error (e.g., show error message)
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
        alert("Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Payment initiation failed. Please try again.");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="container mt-4">
      {/* Timer Display */}
          {timeRemaining && (
            <div className={`alert ${timeRemaining === "EXPIRED" ? "alert-danger" : "alert-warning"} text-center mb-4 ${
              timeRemaining !== "EXPIRED" && timeRemaining.startsWith("00:") && parseInt(timeRemaining.split(":")[1]) < 10 ? "timer-urgent" : ""
            }`} role="alert">
              <div className="d-flex justify-content-center align-items-center">
                <i className="fas fa-clock me-2"></i>
                <strong>
                  {timeRemaining === "EXPIRED" ? (
                    <div>
                      <div className="mb-2">⏰ Booking Hold Time EXPIRED! Try again.</div>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      ⏰ Complete your booking within: {" "}
                      <span className="badge bg-dark fs-6 ms-2">{timeRemaining}</span>
                    </>
                  )}
                </strong>
              </div>
            </div>
          )}

          <h3 className="mb-4">Please Enter Passenger Details</h3>
      <p className="text-muted small mb-4">Note: Child fares will be adjusted in invoice</p>

      {tickets.map((ticket, index) => (
        <div key={ticket.ticketId} className="card mb-3">
          <div className="card-body">
            {index === 0 && userTypeInfo && (
              <div className="alert alert-info alert-dismissible fade show" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Primary Passenger:</strong> Your details have been auto-filled. You can modify them if needed.
              </div>
            )}
            <p><strong>Coach:</strong> {ticket.coachId}</p>
            <p><strong>Fare:</strong> {ticket.fare}</p>
            <p><strong>Seat Number:</strong> {ticket.seatNum}</p>

            <div className="form-group">
              <label>Passenger Name *</label>
              <input
                type="text"
                className={`form-control ${errors[`${index}_passengerName`] ? 'is-invalid' : ''}`}
                required
                value={passengerDetails[index]?.passengerName || ""}
                onChange={(e) =>
                  handlePassengerChange(index, "passengerName", e.target.value)
                }
                disabled={timeRemaining === "EXPIRED"}
              />
              {errors[`${index}_passengerName`] && (
                <p className="text-danger mt-1 mb-0">{errors[`${index}_passengerName`]}</p>
              )}
            </div>

            <div className="form-group mt-2">
              <label>Passenger Type *</label>
              <select
                className={`form-select ${errors[`${index}_passengerType`] ? 'is-invalid' : ''}`}
                value={passengerDetails[index]?.passengerType || "A"}
                onChange={(e) =>
                  handlePassengerChange(index, "passengerType", e.target.value)
                }
                disabled={timeRemaining === "EXPIRED"}
              >
                <option value="A">Adult</option>
                <option value="C">Child</option>
              </select>
              {errors[`${index}_passengerType`] && (
                <p className="text-danger mt-1 mb-0">{errors[`${index}_passengerType`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <button 
        className="btn btn-primary mt-3" 
        onClick={handleGenerateInvoice}
        disabled={isSubmitting || timeRemaining === "EXPIRED"}
      >
        {isSubmitting ? 'Generating Invoice...' : 
         timeRemaining === "EXPIRED" ? 'Booking Expired' : 'Generate Invoice'}
      </button>

      {/* Invoice Display Card */}
      {invoice && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Invoice Details</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Invoice ID:</strong> {invoice.invoiceId}</p>
                <p><strong>Booking ID:</strong> {invoice.bookingId}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Base Fare:</strong> ৳{invoice.baseFare.toFixed(2)}</p>
                <p><strong>VAT:</strong> ৳{invoice.vat.toFixed(2)}</p>
                <p><strong>Service Charge:</strong> ৳{invoice.serviceCharge.toFixed(2)}</p>
                <p><strong>Bedding Charge:</strong> ৳{invoice.beddingCharge.toFixed(2)}</p>
                <hr />
                <p><strong>Total Amount:</strong> ৳{invoice.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-3">
              {!showPaymentOptions ? (
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handlePayNow}
                >
                  Pay Now - ৳{invoice.total.toFixed(2)}
                </button>
              ) : (
                <div>
                  <h6 className="mb-3">Select Payment Method</h6>
                  <button 
                    className="btn btn-outline-primary btn-lg me-2"
                    onClick={handleBkashPayment}
                  >
                    <i className="fas fa-mobile-alt me-2"></i>
                    Pay with Bkash - ৳{invoice.total.toFixed(2)}
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm mt-2"
                    onClick={() => setShowPaymentOptions(false)}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for timer effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
            100% {
              opacity: 1;
            }
          }
          
          .timer-urgent {
            animation: pulse 1s infinite;
            border: 2px solid #dc3545 !important;
          }
          
          .timer-urgent .badge {
            background-color: #dc3545 !important;
            animation: pulse 1s infinite;
          }
        `
      }} />
      
    </div>
    </>
  );
};

export default BookingDetails;