package com.eticket.railway.DTO;

public class TrainDTO {
    private String fromStation;
    private String toStation;
    

    public TrainDTO(String fromStation, String toStation) {
        this.fromStation = fromStation;
        this.toStation = toStation;
    }
    public String getFromStation() {
        return fromStation;
    }
    public void setFromStation(String fromStation) {
        this.fromStation = fromStation;
    }
    public String getToStation() {
        return toStation;
    }
    public void setToStation(String toStation) {
        this.toStation = toStation;
    }

    

}
