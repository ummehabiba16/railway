package com.eticket.railway.DTO;

public class RouteDTO {
    private String trainId;
    private String fromStationId;
    private String stationName;
    private String arrivalTime;
    private String departureTime;
    private int halt;
    private int routeDuration;
    private int routeSequence;
    private String isActive;

    // Default constructor
    public RouteDTO() {}

    // Constructor for creating new route
    public RouteDTO(String trainId, String fromStationId, String arrivalTime, String departureTime, 
                    int halt, int routeDuration, int routeSequence) {
        this.trainId = trainId;
        this.fromStationId = fromStationId;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.halt = halt;
        this.routeDuration = routeDuration;
        this.routeSequence = routeSequence;
        this.isActive = "Y";
    }

    // Constructor with station name for display
    public RouteDTO(String trainId, String fromStationId, String stationName, String arrivalTime, String departureTime, 
                    int halt, int routeDuration, int routeSequence, String isActive) {
        this.trainId = trainId;
        this.fromStationId = fromStationId;
        this.stationName = stationName;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.halt = halt;
        this.routeDuration = routeDuration;
        this.routeSequence = routeSequence;
        this.isActive = isActive;
    }

    // Getters and Setters
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

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public int getHalt() {
        return halt;
    }

    public void setHalt(int halt) {
        this.halt = halt;
    }

    public int getRouteDuration() {
        return routeDuration;
    }

    public void setRouteDuration(int routeDuration) {
        this.routeDuration = routeDuration;
    }

    public int getRouteSequence() {
        return routeSequence;
    }

    public void setRouteSequence(int routeSequence) {
        this.routeSequence = routeSequence;
    }

    public String getIsActive() {
        return isActive;
    }

    public void setIsActive(String isActive) {
        this.isActive = isActive;
    }
}
