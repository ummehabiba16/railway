package com.eticket.railway.DTO;

public class TrainInfoDTO {
    private String TrainId;
    private String TrainName;
    private String DepartureTime;
    private String ArrivalTime;
    
    public TrainInfoDTO(String trainId, String trainName, String departureTime, String arrivalTime) {
        TrainId = trainId;
        TrainName = trainName;
        DepartureTime = departureTime;
        ArrivalTime = arrivalTime;
    }
    public String getTrainId() {
        return TrainId;
    }
    public void setTrainId(String trainId) {
        TrainId = trainId;
    }
    public String getTrainName() {
        return TrainName;
    }
    public void setTrainName(String trainName) {
        TrainName = trainName;
    }
    public String getDepartureTime() {
        return DepartureTime;
    }
    public void setDepartureTime(String departureTime) {
        DepartureTime = departureTime;
    }
    public String getArrivalTime() {
        return ArrivalTime;
    }
    public void setArrivalTime(String arrivalTime) {
        ArrivalTime = arrivalTime;
    }
    
    
    
}
