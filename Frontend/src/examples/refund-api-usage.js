// Example usage in MyBookings.js
// This shows how to call the refund API from the frontend

const initiateRefund = async (bookingId) => {
    try {
        const refundRequest = {
            bookingId: bookingId,
            refundRemarks: "Customer requested refund"
        };

        const response = await fetch('/api/refund/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(refundRequest)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.status === 'success') {
                alert(`Refund initiated successfully! Refund amount: BDT ${result.refundAmount}. Reference ID: ${result.refundRefId}`);
                // Redirect to refund status page or refresh bookings
                window.location.reload();
            } else {
                alert(`Refund initiation failed: ${result.errorReason}`);
            }
        } else {
            alert(`Error: ${result}`);
        }
    } catch (error) {
        console.error('Error initiating refund:', error);
        alert('Failed to initiate refund. Please try again.');
    }
};

const checkRefundStatus = async (refundRefId) => {
    try {
        const response = await fetch(`/api/refund/status?refundRefId=${refundRefId}`);
        const result = await response.json();

        if (response.ok) {
            console.log('Refund status:', result.status);
            // Update UI with refund status
        } else {
            console.error('Error checking refund status:', result);
        }
    } catch (error) {
        console.error('Error checking refund status:', error);
    }
};

const getRefundByBooking = async (bookingId) => {
    try {
        const response = await fetch(`/api/refund/booking?bookingId=${bookingId}`);
        
        if (response.ok) {
            const refund = await response.json();
            console.log('Refund details:', refund);
            // Display refund information in UI
            return refund;
        } else if (response.status === 404) {
            console.log('No refund found for this booking');
            return null;
        } else {
            const error = await response.text();
            console.error('Error getting refund:', error);
            return null;
        }
    } catch (error) {
        console.error('Error getting refund:', error);
        return null;
    }
};

// Example usage:
// initiateRefund('BOOKING123');
// checkRefundStatus('REFUND_REF_ID_123');
// getRefundByBooking('BOOKING123');
