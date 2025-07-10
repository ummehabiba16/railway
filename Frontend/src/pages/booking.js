import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api"; // your axios instance

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

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
        setPassengerDetails(
          response.data.map((ticket) => ({
            ticketId: ticket.ticketId,
            passengerName: "",
            passengerType: "A", // default to Adult
            fare: ticket.fare,
          }))
        );
      } catch (err) {
        console.error("Error fetching booking details:", err);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

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
    <div className="container mt-4">
      <h3 className="mb-4">Please Enter Passenger Details</h3>
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
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Generating Invoice...' : 'Generate Invoice'}
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
    </div>
  );
};

export default BookingDetails;