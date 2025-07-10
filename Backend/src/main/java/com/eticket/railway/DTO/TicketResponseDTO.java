package com.eticket.railway.DTO;

public class TicketResponseDTO {
    private String ticketId;
    private String seatNum;
    private char berthPosition;
    private String ticketStatus;
    public TicketResponseDTO(String ticketId, String seatNum, char berthPosition, String ticketStatus) {
        this.ticketId = ticketId;
        this.seatNum = seatNum;
        this.berthPosition = berthPosition;
        this.ticketStatus = ticketStatus;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getSeatNum() {
        return seatNum;
    }

    public void setSeatNum(String seatNum) {
        this.seatNum = seatNum;
    }

    public char getBerthPosition() {
        return berthPosition;
    }

    public void setBerthPosition(char berthPosition) {
        this.berthPosition = berthPosition;
    }

    public String getTicketStatus() {
        return ticketStatus;
    }

    public void setTicketStatus(String ticketStatus) {
        this.ticketStatus = ticketStatus;
    }








}
