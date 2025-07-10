package com.eticket.railway.DTO;

public class BookingDetailsResponse {
    /*"ticketId": "T00123",
    "fare": 350,
    "seatNum": "B1-23" */
    private String ticketId;
    private int fare;
    private String seatNum;
    private String coachId;
    public String getTicketId() {
        return ticketId;
    }
    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
    public int getFare() {
        return fare;
    }
    public void setFare(int fare) {
        this.fare = fare;
    }
    public String getSeatNum() {
        return seatNum;
    }
    public void setSeatNum(String seatNum) {
        this.seatNum = seatNum;
    }
    public BookingDetailsResponse(String ticketId, int fare, String seatNum, String coachId) {
        this.ticketId = ticketId;
        this.fare = fare;
        this.seatNum = seatNum;
        this.coachId = coachId;
    }
    public String getCoachId() {
        return coachId;
    }
    public void setCoachId(String coachId) {
        this.coachId = coachId;
    }
    
    

}
