package com.eticket.railway.DTO;

import java.time.LocalDate;

public class RulesDTO {
    private LocalDate appliedFrom;
    private Integer ticketAvailableBefore;
    private Integer bookingHoldTime;
    private Integer childFarePercentage;
    private Integer serviceCharge;
    private Integer beddingCharge;
    private Integer monthlyBookingLimit;
    private Integer blockingTime;

    public RulesDTO() {
    }

    public RulesDTO(LocalDate appliedFrom, Integer ticketAvailableBefore, Integer bookingHoldTime,
                   Integer childFarePercentage, Integer serviceCharge, Integer beddingCharge,
                   Integer monthlyBookingLimit, Integer blockingTime) {
        this.appliedFrom = appliedFrom;
        this.ticketAvailableBefore = ticketAvailableBefore;
        this.bookingHoldTime = bookingHoldTime;
        this.childFarePercentage = childFarePercentage;
        this.serviceCharge = serviceCharge;
        this.beddingCharge = beddingCharge;
        this.monthlyBookingLimit = monthlyBookingLimit;
        this.blockingTime = blockingTime;
    }

    // Getters and Setters
    public LocalDate getAppliedFrom() {
        return appliedFrom;
    }

    public void setAppliedFrom(LocalDate appliedFrom) {
        this.appliedFrom = appliedFrom;
    }

    public Integer getTicketAvailableBefore() {
        return ticketAvailableBefore;
    }

    public void setTicketAvailableBefore(Integer ticketAvailableBefore) {
        this.ticketAvailableBefore = ticketAvailableBefore;
    }

    public Integer getBookingHoldTime() {
        return bookingHoldTime;
    }

    public void setBookingHoldTime(Integer bookingHoldTime) {
        this.bookingHoldTime = bookingHoldTime;
    }

    public Integer getChildFarePercentage() {
        return childFarePercentage;
    }

    public void setChildFarePercentage(Integer childFarePercentage) {
        this.childFarePercentage = childFarePercentage;
    }

    public Integer getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(Integer serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public Integer getBeddingCharge() {
        return beddingCharge;
    }

    public void setBeddingCharge(Integer beddingCharge) {
        this.beddingCharge = beddingCharge;
    }

    public Integer getMonthlyBookingLimit() {
        return monthlyBookingLimit;
    }

    public void setMonthlyBookingLimit(Integer monthlyBookingLimit) {
        this.monthlyBookingLimit = monthlyBookingLimit;
    }

    public Integer getBlockingTime() {
        return blockingTime;
    }

    public void setBlockingTime(Integer blockingTime) {
        this.blockingTime = blockingTime;
    }
}
