package com.eticket.railway.DTO;

public class StationMasterProfileDTO {
    private String name;
    private String email;
    private String phoneNum;
    private String stationName;
    private String stationLocation;
    private String stationDivision;
    private String stationContactNum;

    public StationMasterProfileDTO() {
    }

    public StationMasterProfileDTO(String name, String email, String phoneNum, String stationName, 
                                   String stationLocation, String stationDivision, String stationContactNum) {
        this.name = name;
        this.email = email;
        this.phoneNum = phoneNum;
        this.stationName = stationName;
        this.stationLocation = stationLocation;
        this.stationDivision = stationDivision;
        this.stationContactNum = stationContactNum;
    }

    // Getters and setters
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

    public String getPhoneNum() {
        return phoneNum;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getStationLocation() {
        return stationLocation;
    }

    public void setStationLocation(String stationLocation) {
        this.stationLocation = stationLocation;
    }

    public String getStationDivision() {
        return stationDivision;
    }

    public void setStationDivision(String stationDivision) {
        this.stationDivision = stationDivision;
    }

    public String getStationContactNum() {
        return stationContactNum;
    }

    public void setStationContactNum(String stationContactNum) {
        this.stationContactNum = stationContactNum;
    }

    @Override
    public String toString() {
        return "StationMasterProfileDTO{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phoneNum='" + phoneNum + '\'' +
                ", stationName='" + stationName + '\'' +
                ", stationLocation='" + stationLocation + '\'' +
                ", stationDivision='" + stationDivision + '\'' +
                ", stationContactNum='" + stationContactNum + '\'' +
                '}';
    }
}
