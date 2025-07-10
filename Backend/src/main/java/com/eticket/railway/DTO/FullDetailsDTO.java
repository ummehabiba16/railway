package com.eticket.railway.DTO;

public class FullDetailsDTO {
    //ROUTESEQUENCE, FROMSTATIONID, ARRIVALTIME, DEPARTURETIME, HALT, ROUTEDURATION
    private String trainId;
    private int routeSequence;
    private String stationName;
    private String arrivalTime;
    private String departureTime;
    private int halt;
    private int routeDuration;

    
    public FullDetailsDTO(String trainId, int routeSequence, String stationName, String arrivalTime,
            String departureTime, int halt, int routeDuration) {
        this.trainId = trainId;
        this.routeSequence = routeSequence;
        this.stationName = stationName;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.halt = halt;
        this.routeDuration = routeDuration;
    }
    public FullDetailsDTO(int routeSequence, String stationName, String arrivalTime, String departureTime, int halt,
            int routeDuration) {
        this.routeSequence = routeSequence;
        this.stationName = stationName;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.halt = halt;
        this.routeDuration = routeDuration;
    }
    public String getTrainId() {
        return trainId;
    }
    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }
    public int getRouteSequence() {
        return routeSequence;
    }
    public void setRouteSequence(int routeSequence) {
        this.routeSequence = routeSequence;
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

    
}
