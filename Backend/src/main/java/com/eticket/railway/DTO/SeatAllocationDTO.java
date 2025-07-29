package com.eticket.railway.DTO;

public class SeatAllocationDTO {
    private String trainSeatId;
    private String seatId;
    private String trainId;
    private String fromStationId;
    private String toStationId;
    private String classId;
    private double fare;

    // Default constructor
    public SeatAllocationDTO() {}

    // Constructor
    public SeatAllocationDTO(String trainSeatId, String seatId, String trainId, String fromStationId, 
                           String toStationId, String classId, double fare) {
        this.trainSeatId = trainSeatId;
        this.seatId = seatId;
        this.trainId = trainId;
        this.fromStationId = fromStationId;
        this.toStationId = toStationId;
        this.classId = classId;
        this.fare = fare;
    }

    // Getters and Setters
    public String getTrainSeatId() {
        return trainSeatId;
    }

    public void setTrainSeatId(String trainSeatId) {
        this.trainSeatId = trainSeatId;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public String getTrainId() {
        return trainId;
    }

    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }

    public String getFromStationId() {
        return fromStationId;
    }

    public void setFromStationId(String fromStationId) {
        this.fromStationId = fromStationId;
    }

    public String getToStationId() {
        return toStationId;
    }

    public void setToStationId(String toStationId) {
        this.toStationId = toStationId;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public double getFare() {
        return fare;
    }

    public void setFare(double fare) {
        this.fare = fare;
    }
}
