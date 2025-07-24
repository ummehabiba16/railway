package com.eticket.railway.DTO;

public class RefundRequest {
    private String bookingId;
    private String refundRemarks;

    public RefundRequest() {
        // Default constructor
    }

    public RefundRequest(String bookingId, String refundRemarks) {
        this.bookingId = bookingId;
        this.refundRemarks = refundRemarks;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getRefundRemarks() {
        return refundRemarks;
    }

    public void setRefundRemarks(String refundRemarks) {
        this.refundRemarks = refundRemarks;
    }
}
