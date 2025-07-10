package com.eticket.railway.DTO;

public class BookingResponseDTO {
    // private String trainId;
    // private String classId;
    // private String date;
    private String coachId;
    private String coachName;
    private int ticketCount;
    private int seatCount;

    public BookingResponseDTO(String coachId, String coachName, int ticketCount, int seatCount) {
        this.coachId = coachId;
        this.coachName = coachName;
        this.ticketCount = ticketCount;
        this.seatCount = seatCount;
    }

    
    public String getCoachId() {
        return coachId;
    }

    public void setCoachId(String coachId) {
        this.coachId = coachId;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public int getTicketCount() {
        return ticketCount;
    }

    public void setTicketCount(int ticketCount) {
        this.ticketCount = ticketCount;
    }
    public int getSeatCount() {
        return seatCount;
    }
    public void setSeatCount(int seatCount) {
        this.seatCount = seatCount;
    }

}
