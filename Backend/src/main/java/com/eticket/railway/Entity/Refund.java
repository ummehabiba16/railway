package com.eticket.railway.Entity;

import java.sql.Timestamp;

import org.springframework.data.relational.core.mapping.Table;

@Table(name = "REFUND")
public class Refund {
    private String paymentId;
    private String bookingId;
    private int refundAmount;
    private String refundStatus = "Requested";
    private Timestamp requestTime = new Timestamp(System.currentTimeMillis());
    private Timestamp processedTime;
    private String refundTransId;
    private String refundRefId;
    private String bankTranId;

    public Refund() {
        // Default constructor
    }

    public Refund(String paymentId, String bookingId, int refundAmount, String refundStatus, 
                  Timestamp requestTime, Timestamp processedTime, String refundTransId, String refundRefId, String bankTranId) {
        this.paymentId = paymentId;
        this.bookingId = bookingId;
        this.refundAmount = refundAmount;
        this.refundStatus = refundStatus;
        this.requestTime = requestTime;
        this.processedTime = processedTime;
        this.refundTransId = refundTransId;
        this.refundRefId = refundRefId;
        this.bankTranId = bankTranId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public int getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(int refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public Timestamp getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(Timestamp requestTime) {
        this.requestTime = requestTime;
    }

    public Timestamp getProcessedTime() {
        return processedTime;
    }

    public void setProcessedTime(Timestamp processedTime) {
        this.processedTime = processedTime;
    }

    public String getRefundTransId() {
        return refundTransId;
    }

    public void setRefundTransId(String refundTransId) {
        this.refundTransId = refundTransId;
    }

    public String getRefundRefId() {
        return refundRefId;
    }

    public void setRefundRefId(String refundRefId) {
        this.refundRefId = refundRefId;
    }

    public String getBankTranId() {
        return bankTranId;
    }

    public void setBankTranId(String bankTranId) {
        this.bankTranId = bankTranId;
    }
}
