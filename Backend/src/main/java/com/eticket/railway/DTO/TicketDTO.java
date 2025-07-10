package com.eticket.railway.DTO;

public class TicketDTO {

    /*
     * setPassengerDetails(
          response.data.map((ticket) => ({
            ticketId: ticket.ticketId,
            passengerName: "",
            passengerType: "A", // default to Adult
            fare: ticket.fare,
          }))
        );
     */

    private String ticketId;
    private String passengerName;
    private String passengerType; // A for Adult, C for Child, S for Senior
    private double fare;
    public TicketDTO(String ticketId, String passengerName, String passengerType, double fare) {
        this.ticketId = ticketId;
        this.passengerName = passengerName;
        this.passengerType = passengerType;
        this.fare = fare;
    }
    public String getTicketId() {
        return ticketId;
    }
    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
    public String getPassengerName() {
        return passengerName;
    }
    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }
    public String getPassengerType() {
        return passengerType;
    }
    public void setPassengerType(String passengerType) {
        this.passengerType = passengerType;
    }
    public double getFare() {
        return fare;
    }
    public void setFare(double fare) {
        this.fare = fare;
    }

    
    
}
