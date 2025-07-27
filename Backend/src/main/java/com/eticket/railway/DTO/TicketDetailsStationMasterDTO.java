package com.eticket.railway.DTO;

public class TicketDetailsStationMasterDTO {
    private String bookingId;
    private String trainName;
    private String travelDate;
    private String travelTime;
    private String starting;
    private String destination;
    private String passengerName;
    private String passengerType;
    private String coachName;
    private String className;
    private String seatNum;
    private String berthPosition;
    private String nid; // From booking table
    private Double total;
    private String trxId;

    public TicketDetailsStationMasterDTO() {
    }

    public TicketDetailsStationMasterDTO(String bookingId, String trainName, String travelDate, String travelTime,
                                       String starting, String destination, String passengerName, String passengerType,
                                       String coachName, String className, String seatNum, String berthPosition,
                                       String nid, Double total, String trxId) {
        this.bookingId = bookingId;
        this.trainName = trainName;
        this.travelDate = travelDate;
        this.travelTime = travelTime;
        this.starting = starting;
        this.destination = destination;
        this.passengerName = passengerName;
        this.passengerType = passengerType;
        this.coachName = coachName;
        this.className = className;
        this.seatNum = seatNum;
        this.berthPosition = berthPosition;
        this.nid = nid;
        this.total = total;
        this.trxId = trxId;
    }

    // Getters and Setters
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public String getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }

    public String getTravelTime() {
        return travelTime;
    }

    public void setTravelTime(String travelTime) {
        this.travelTime = travelTime;
    }

    public String getStarting() {
        return starting;
    }

    public void setStarting(String starting) {
        this.starting = starting;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
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

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
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

    public String getNid() {
        return nid;
    }

    public void setNid(String nid) {
        this.nid = nid;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getTrxId() {
        return trxId;
    }

    public void setTrxId(String trxId) {
        this.trxId = trxId;
    }
}
