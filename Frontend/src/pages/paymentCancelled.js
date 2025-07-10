import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentResult.css';

const PaymentCancelled = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [cancellationDetails, setCancellationDetails] = useState({
        invoice: ''
    });

    useEffect(() => {
        // Extract cancellation details from URL parameters
        const invoice = searchParams.get('invoice') || '';

        setCancellationDetails({
            invoice
        });

        // Optional: Clear URL parameters after a delay for cleaner URL
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }, [searchParams]);

    const handleRetryPayment = () => {
        // Navigate back to booking or payment page
        if (cancellationDetails.invoice) {
            navigate(`/booking/payment?invoice=${cancellationDetails.invoice}`);
        } else {
            navigate('/booking');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        navigate('/bookings');
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card cancelled-card">
                <div className="cancelled-icon">
                    <div className="info-mark">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4"/>
                            <path d="M12 8h.01"/>
                        </svg>
                    </div>
                </div>
                
                <h1 className="result-title">Payment Cancelled</h1>
                <p className="result-message">
                    You have cancelled the payment process. Your booking is still pending and no charges have been made.
                </p>

                <div className="payment-details">
                    <h3>Transaction Details</h3>
                    {cancellationDetails.invoice && (
                        <div className="detail-row">
                            <span className="detail-label">Invoice ID:</span>
                            <span className="detail-value">{cancellationDetails.invoice}</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value cancelled-status">Cancelled</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{new Date().toLocaleString()}</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleRetryPayment}
                    >
                        Complete Payment
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleViewBookings}
                    >
                        View My Bookings
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={handleGoHome}
                    >
                        Go to Home
                    </button>
                </div>

                <div className="additional-info">
                    <div className="booking-info">
                        <h4>What happens next?</h4>
                        <ul>
                            <li>Your booking reservation is still active for a limited time</li>
                            <li>You can complete the payment later to confirm your booking</li>
                            <li>Incomplete bookings may be automatically cancelled after 30 minutes</li>
                            <li>No charges have been made to your account</li>
                        </ul>
                    </div>
                    
                    <div className="help-section">
                        <p>
                            <strong>Need Help?</strong> If you encountered any issues during the payment process, 
                            please contact our support team at support@eticket.com or call +8801XXXXXXX.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelled;