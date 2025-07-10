package com.eticket.railway.DTO;

public class PaymentRequest {
    /* invoiceId: invoice.invoiceId,
        amount: invoice.total, // put actual amount
        currency: "BDT",
        userId : userId
      */
    private String invoiceId;
    private double amount;
    private String currency;
    private String userId;
    public PaymentRequest(String invoiceId, double amount, String currency, String userId) {
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.currency = currency;
        this.userId = userId;
    }
    public String getInvoiceId() {
        return invoiceId;
    }
    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }
    public double getAmount() {
        return amount;
    }
    public void setAmount(double amount) {
        this.amount = amount;
    }
    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    
}

