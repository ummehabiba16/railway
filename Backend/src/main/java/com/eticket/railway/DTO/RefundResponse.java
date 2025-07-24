package com.eticket.railway.DTO;

public class RefundResponse {
    private String apiConnect;
    private String bankTranId;
    private String transId;
    private String refundRefId;
    private String status;
    private String errorReason;
    private int refundAmount;
    private String bookingId;
    private String paymentId;

    public RefundResponse() {
        // Default constructor
    }

    public RefundResponse(String apiConnect, String bankTranId, String transId, String refundRefId, 
                         String status, String errorReason, int refundAmount, String bookingId, String paymentId) {
        this.apiConnect = apiConnect;
        this.bankTranId = bankTranId;
        this.transId = transId;
        this.refundRefId = refundRefId;
        this.status = status;
        this.errorReason = errorReason;
        this.refundAmount = refundAmount;
        this.bookingId = bookingId;
        this.paymentId = paymentId;
    }

    public String getApiConnect() {
        return apiConnect;
    }

    public void setApiConnect(String apiConnect) {
        this.apiConnect = apiConnect;
    }

    public String getBankTranId() {
        return bankTranId;
    }

    public void setBankTranId(String bankTranId) {
        this.bankTranId = bankTranId;
    }

    public String getTransId() {
        return transId;
    }

    public void setTransId(String transId) {
        this.transId = transId;
    }

    public String getRefundRefId() {
        return refundRefId;
    }

    public void setRefundRefId(String refundRefId) {
        this.refundRefId = refundRefId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorReason() {
        return errorReason;
    }

    public void setErrorReason(String errorReason) {
        this.errorReason = errorReason;
    }

    public int getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(int refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
}
