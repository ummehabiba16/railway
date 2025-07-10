import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentResult.css';

const PaymentFailed = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [failureDetails, setFailureDetails] = useState({
        invoice: '',
        reason: '',
        status: '',
        error: ''
    });

    useEffect(() => {
        // Extract failure details from URL parameters
        const invoice = searchParams.get('invoice') || '';
        const reason = searchParams.get('reason') || '';
        const status = searchParams.get('status') || '';
        const error = searchParams.get('error') || '';

        setFailureDetails({
            invoice,
            reason,
            status,
            error
        });

        // Optional: Clear URL parameters after a delay for cleaner URL
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }, [searchParams]);

    const handleRetryPayment = () => {
        // Navigate back to booking or payment page
        if (failureDetails.invoice) {
            navigate(`/booking/payment?invoice=${failureDetails.invoice}`);
        } else {
            navigate('/booking');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleContactSupport = () => {
        // You can implement contact support functionality here
        // For now, we'll just show an alert
        alert('Please contact our support team at support@eticket.com or call +8801XXXXXXX for assistance.');
    };

    const getFailureMessage = () => {
        if (failureDetails.error === 'missing_params') {
            return 'Payment failed due to missing required information. Please try again.';
        }
        if (failureDetails.error === 'processing_error') {
            return 'An error occurred while processing your payment. Please try again later.';
        }
        if (failureDetails.reason) {
            return `Payment failed: ${failureDetails.reason}`;
        }
        return 'Your payment could not be processed. Please try again or contact support.';
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card failed-card">
                <div className="failed-icon">
                    <div className="cross-mark">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M15 9l-6 6"/>
                            <path d="M9 9l6 6"/>
                        </svg>
                    </div>
                </div>
                
                <h1 className="result-title">Payment Failed</h1>
                <p className="result-message">
                    {getFailureMessage()}
                </p>

                <div className="payment-details">
                    <h3>Transaction Details</h3>
                    {failureDetails.invoice && (
                        <div className="detail-row">
                            <span className="detail-label">Invoice ID:</span>
                            <span className="detail-value">{failureDetails.invoice}</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value failed-status">Failed</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{new Date().toLocaleString()}</span>
                    </div>
                    {failureDetails.reason && (
                        <div className="detail-row">
                            <span className="detail-label">Reason:</span>
                            <span className="detail-value">{failureDetails.reason}</span>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleRetryPayment}
                    >
                        Try Again
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleContactSupport}
                    >
                        Contact Support
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={handleGoHome}
                    >
                        Go to Home
                    </button>
                </div>

                <div className="additional-info">
                    <div className="troubleshooting">
                        <h4>Common Issues & Solutions:</h4>
                        <ul>
                            <li>Check if your card has sufficient balance</li>
                            <li>Verify your card details are correct</li>
                            <li>Try using a different payment method</li>
                            <li>Check if your internet connection is stable</li>
                            <li>Contact your bank if the issue persists</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;