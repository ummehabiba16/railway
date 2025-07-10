package com.eticket.railway.DTO;

public class SearchDTO {
    private String fromStation;
    private String toStation;
    private String date;
    private String class_;

    public SearchDTO() {
    }

    public SearchDTO(String fromStation, String toStation, String date, String class_) {
        this.fromStation = fromStation;
        this.toStation = toStation;
        this.date = date;
        this.class_ = class_;
    }
    public String getClass_() {
        return class_;
    }
    public void setClass_(String class_) {
        this.class_ = class_;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
    
}
