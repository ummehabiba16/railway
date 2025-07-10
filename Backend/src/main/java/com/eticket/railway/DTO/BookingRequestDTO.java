package com.eticket.railway.DTO;

import java.util.List;

public class BookingRequestDTO {
    private String userId;
    private String travelDate;
    private List<String> ticketIds;
    public BookingRequestDTO(String userId, String travelDate, List<String> ticketIds) {
        this.userId = userId;
        this.travelDate = travelDate;
        this.ticketIds = ticketIds;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getTravelDate() {
        return travelDate;
    }
    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }
    public List<String> getTicketIds() {
        return ticketIds;
    }
    public void setTicketIds(List<String> ticketIds) {
        this.ticketIds = ticketIds;
    }

    
}
