package com.eticket.railway.DTO;

public class SeatDTO {
    private String seatId;
    private String seatNum;
    private String berthPosition;
    private String coachId;
    private boolean allocated;

    // Default constructor
    public SeatDTO() {}

    // Constructor
    public SeatDTO(String seatId, String seatNum, String berthPosition, String coachId) {
        this.seatId = seatId;
        this.seatNum = seatNum;
        this.berthPosition = berthPosition;
        this.coachId = coachId;
        this.allocated = false;
    }

    // Constructor with allocation status
    public SeatDTO(String seatId, String seatNum, String berthPosition, String coachId, boolean allocated) {
        this.seatId = seatId;
        this.seatNum = seatNum;
        this.berthPosition = berthPosition;
        this.coachId = coachId;
        this.allocated = allocated;
    }

    // Getters and Setters
    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public String getSeatNum() {
        return seatNum;
    }

    public void setSeatNum(String seatNum) {
        this.seatNum = seatNum;
    }

    public String getBerthPosition() {
        return berthPosition;
    }

    public void setBerthPosition(String berthPosition) {
        this.berthPosition = berthPosition;
    }

    public String getCoachId() {
        return coachId;
    }

    public void setCoachId(String coachId) {
        this.coachId = coachId;
    }

    public boolean isAllocated() {
        return allocated;
    }

    public void setAllocated(boolean allocated) {
        this.allocated = allocated;
    }
}
