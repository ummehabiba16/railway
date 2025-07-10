package com.eticket.railway.Entity;
import java.sql.Timestamp;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table(name = "PAYMENT")
public class Payment{
    @Id
    private String paymentId;

    private String trxId;

    private String paymentMode;

    private String status;

    private Timestamp paymentTime = new Timestamp(System.currentTimeMillis());

    private String invoiceId;

    public Payment(String paymentId, String trxId, String paymentMode, String status, Timestamp paymentTime, String invoiceId) {
        this.paymentId = paymentId;
        this.trxId = trxId;
        this.paymentMode = paymentMode;
        this.status = status;
        this.paymentTime = paymentTime;
        this.invoiceId = invoiceId;
    }
    public Payment() {
        // Default constructor
    }
    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getTrxId() {
        return trxId;
    }

    public void setTrxId(String trxId) {
        this.trxId = trxId;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(Timestamp paymentTime) {
        this.paymentTime = paymentTime;
    }

    public String getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }

    

}

