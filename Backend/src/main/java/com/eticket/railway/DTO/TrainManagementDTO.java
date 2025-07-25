package com.eticket.railway.DTO;

public class TrainManagementDTO {
    private String trainId;
    private String trainNum;
    private String trainName;
    private String fromId;
    private String fromStation;
    private String toId;
    private String toStation;
    private String offDay;

    // Default constructor
    public TrainManagementDTO() {}

    // Constructor with all fields
    public TrainManagementDTO(String trainId, String trainNum, String trainName, 
                             String fromId, String fromStation, String toId, String toStation, String offDay) {
        this.trainId = trainId;
        this.trainNum = trainNum;
        this.trainName = trainName;
        this.fromId = fromId;
        this.fromStation = fromStation;
        this.toId = toId;
        this.toStation = toStation;
        this.offDay = offDay;
    }

    // Getters and Setters
    public String getTrainId() {
        return trainId;
    }

    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }

    public String getTrainNum() {
        return trainNum;
    }

    public void setTrainNum(String trainNum) {
        this.trainNum = trainNum;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public String getFromId() {
        return fromId;
    }

    public void setFromId(String fromId) {
        this.fromId = fromId;
    }

    public String getFromStation() {
        return fromStation;
    }

    public void setFromStation(String fromStation) {
        this.fromStation = fromStation;
    }

    public String getToId() {
        return toId;
    }

    public void setToId(String toId) {
        this.toId = toId;
    }

    public String getToStation() {
        return toStation;
    }

    public void setToStation(String toStation) {
        this.toStation = toStation;
    }

    public String getOffDay() {
        return offDay;
    }

    public void setOffDay(String offDay) {
        this.offDay = offDay;
    }
}
