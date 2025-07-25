package com.eticket.railway.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("STATION_MASTER")
public class StationMaster {
    
    @Id
    private String masterId;
    private String name;
    private String email;
    private String stationId;
    private String phoneNum;

    public StationMaster() {
    }

    public StationMaster(String masterId, String name, String email, String stationId, String phoneNum) {
        this.masterId = masterId;
        this.name = name;
        this.email = email;
        this.stationId = stationId;
        this.phoneNum = phoneNum;
    }

    public String getMasterId() {
        return masterId;
    }

    public void setMasterId(String masterId) {
        this.masterId = masterId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

    @Override
    public String toString() {
        return "StationMaster{" +
                "masterId='" + masterId + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", stationId='" + stationId + '\'' +
                ", phoneNum='" + phoneNum + '\'' +
                '}';
    }
}
