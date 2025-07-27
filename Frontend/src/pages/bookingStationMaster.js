import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // your axios instance
import Navbar from "../components/navBar";

const BookingDetailsStationMaster = () => {
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
  
  // Verification states
  const [verificationData, setVerificationData] = useState({
    type: 'NID',
    value: '',
    verified: false,
    verificationResult: null,
    isVerifying: false
  });
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

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
        setNumberOfTickets(response.data.length);
        console.log('Number of tickets:', numberOfTickets);
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

  const handleVerificationChange = (field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value,
      verified: false,
      verificationResult: null
    }));
    setCanProceed(false);
  };

  const handleVerify = async () => {
    if (!verificationData.value.trim()) {
      alert('Please enter a valid number');
      return;
    }

    setVerificationData(prev => ({ ...prev, isVerifying: true }));

    try {
      const response = await api.post('/verify', {
        type: verificationData.type,
        value: verificationData.value,
        numberOfTickets: numberOfTickets
      });

      const result = response.data;
      setVerificationData(prev => ({
        ...prev,
        verified: true,
        verificationResult: result,
        isVerifying: false
      }));

      if (result.verified === 'Y') {
        setCanProceed(true);
      } else {
        setCanProceed(false);
      }

    } catch (err) {
      console.error('Verification failed:', err);
      setVerificationData(prev => ({ ...prev, isVerifying: false }));
      alert('Verification failed. Please try again.');
    }
  };

  const handleReleaseTickets = async () => {
    try {
      const response = await api.post('/release', null, {
        params: { bookingId }
      });

      if (response.status === 200) {
        navigate('/search');
      }
    } catch (err) {
      console.error('Failed to release tickets:', err);
      alert('Failed to release tickets. Please try again.');
    }
  };

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

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    
    try {
      // First save the invoice
      const saveResponse = await api.post("/booking/invoice/save", invoice);
      console.log("Invoice saved successfully:", saveResponse.data);
      
      // Only proceed if invoice save is successful
      if (saveResponse.status === 200) {
        const response = await api.post("/payment/stationMaster", {
          invoiceId: invoice.invoiceId,
          id : verificationData.value
        });

        console.log("Payment confirmed successfully:", response.data);
        
        // Show success message
        alert("Payment confirmed successfully!");
        
        // Navigate to station master success page with paymentId
        navigate(`/payment/stationMaster/success/${response.data.paymentId}`);
      } else {
        throw new Error("Invoice save failed");
      }
      
    } catch (err) {
      console.error("Payment confirmation error:", err);
      if (err.message === "Invoice save failed") {
        alert("Failed to save invoice. Please try again.");
      } else {
        alert("Payment confirmation failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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

          {/* Verification Section */}
          <div className="card mb-4 verification-section">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-shield-alt me-2 text-primary"></i>
                Identity Verification
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Verification Type</label>
                  <div className="d-flex gap-3 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="verificationType"
                        id="nid"
                        value="NID"
                        checked={verificationData.type === 'NID'}
                        onChange={(e) => handleVerificationChange('type', e.target.value)}
                        disabled={timeRemaining === "EXPIRED" || verificationData.verified}
                      />
                      <label className="form-check-label" htmlFor="nid">
                        National ID (NID)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="verificationType"
                        id="brn"
                        value="BRN"
                        checked={verificationData.type === 'BRN'}
                        onChange={(e) => handleVerificationChange('type', e.target.value)}
                        disabled={timeRemaining === "EXPIRED" || verificationData.verified}
                      />
                      <label className="form-check-label" htmlFor="brn">
                        Birth Registration Number (BRN)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8">
                  <label className="form-label">
                    {verificationData.type === 'NID' ? 'National ID Number' : 'Birth Registration Number'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Enter your ${verificationData.type === 'NID' ? 'National ID' : 'Birth Registration'} number`}
                    value={verificationData.value}
                    onChange={(e) => handleVerificationChange('value', e.target.value)}
                    disabled={timeRemaining === "EXPIRED" || verificationData.verified}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleVerify}
                    disabled={timeRemaining === "EXPIRED" || verificationData.isVerifying || verificationData.verified || !verificationData.value.trim()}
                  >
                    {verificationData.isVerifying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>

              {/* Verification Result */}
              {verificationData.verificationResult && (
                <div className="mt-3">
                  {verificationData.verificationResult.verified === 'Y' ? (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Verification Successful!</strong>
                      {verificationData.verificationResult.name && (
                        <div>Welcome, {verificationData.verificationResult.name}!</div>
                      )}
                      {!verificationData.verificationResult.name && (
                        <div>User verified successfully!</div>
                      )}
                    </div>
                  ) : (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Verification Failed!</strong>
                      <div>User has reached booking limits. Cannot proceed with booking.</div>
                      <div className="mt-2">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleReleaseTickets}
                        >
                          <i className="fas fa-times me-2"></i>
                          Release Tickets & Go Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 className="mb-4">Please Enter Passenger Details</h3>

          {/* Only show passenger details if verification is successful */}
          {verificationData.verified && canProceed ? (
            <>
              <p className="text-muted small mb-4">Note: Child fares will be adjusted in invoice</p>

              {tickets.map((ticket, index) => (
        <div key={ticket.ticketId} className="card mb-3">
          <div className="card-body">
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
              <button 
                className="btn btn-success btn-lg"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    Confirm Payment - ৳{invoice.total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </>
      ) : (
        <div className="alert alert-warning mt-3">
          <i className="fas fa-info-circle me-2"></i>
          Please complete identity verification to proceed with passenger details.
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

          .verification-section {
            border-left: 4px solid #0d6efd;
          }

          .verification-section .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
          }

          .form-check-input:checked {
            background-color: #0d6efd;
            border-color: #0d6efd;
          }

          .verification-result {
            border-radius: 8px;
          }
        `
      }} />
      
    </div>
    </>
  );
};

export default BookingDetailsStationMaster;