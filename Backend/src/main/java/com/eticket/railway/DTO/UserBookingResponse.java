package com.eticket.railway.DTO;

public class UserBookingResponse {
    /*
     * BOOKINGID, TRAVELDATE, BOOKINGTIME, STATUS
     */
    private String bookingId;
    private String travelDate;
    private String bookingTime;
    private String status;
    public UserBookingResponse(String bookingId, String travelDate, String bookingTime, String status) {
        this.bookingId = bookingId;
        this.travelDate = travelDate;
        this.bookingTime = bookingTime;
        this.status = status;
    }
    public String getBookingId() {
        return bookingId;
    }
    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }
    public String getTravelDate() {
        return travelDate;
    }
    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }
    public String getBookingTime() {
        return bookingTime;
    }
    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    
    
}
