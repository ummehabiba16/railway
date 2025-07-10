package com.eticket.railway.DTO;

import java.util.ArrayList;
import java.util.List;

public class SearchResponseDTO {
    private String trainId;
    private String trainName;
    private String departureTime;
    private String arrivalTime;
    private List<AvailabilityPerClassDTO> classes = new ArrayList<>();

    public SearchResponseDTO(String trainId, String trainName, String departureTime, String arrivalTime) {
        this.trainId = trainId;
        this.trainName = trainName;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
    }

    public void addClassInfo(AvailabilityPerClassDTO dto) {
        classes.add(dto);
    }

    public String getTrainId() {
        return trainId;
    }

    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public List<AvailabilityPerClassDTO> getClasses() {
        return classes;
    }

    public void setClasses(List<AvailabilityPerClassDTO> classes) {
        this.classes = classes;
    }

    

}
