package com.eticket.railway.Entity;


import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;


@Table(name = "Invoice")
public class Invoice {

    @Id
    private String invoiceId;

    private String bookingId;

    private double baseFare;

    private double vat;

    private double serviceCharge = 20;

    private double beddingCharge = 0;

    private double total;

    public Invoice() {
        // Default constructor
    }

    

    public Invoice(String invoiceId, String bookingId, double baseFare, double vat, double serviceCharge,
            double beddingCharge, double total) {
        this.invoiceId = invoiceId;
        this.bookingId = bookingId;
        this.baseFare = baseFare;
        this.vat = vat;
        this.serviceCharge = serviceCharge;
        this.beddingCharge = beddingCharge;
        this.total = total;
    }

    public String getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(double baseFare) {
        this.baseFare = baseFare;
    }

    public double getVat() {
        return vat;
    }

    public void setVat(double vat) {
        this.vat = vat;
    }

    public double getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(double serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public double getBeddingCharge() {
        return beddingCharge;
    }

    public void setBeddingCharge(double beddingCharge) {
        this.beddingCharge = beddingCharge;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    
}
