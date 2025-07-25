package com.eticket.railway.DTO;

public class StationWithMasterDTO {
    private String stationId;
    private String stationName;
    private String isOnline;
    private String location;
    private String division;
    private String contactNum;
    private String status;
    private String masterName;
    private String masterEmail;
    private String masterPhone;
    private String password; // Converted from passwordHash

    public StationWithMasterDTO() {
    }

    public StationWithMasterDTO(String stationId, String stationName, String isOnline, String location,
                                String division, String contactNum, String status, String masterName,
                                String masterEmail, String masterPhone, String password) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.isOnline = isOnline;
        this.location = location;
        this.division = division;
        this.contactNum = contactNum;
        this.status = status;
        this.masterName = masterName;
        this.masterEmail = masterEmail;
        this.masterPhone = masterPhone;
        this.password = password;
    }

    // Getters and setters
    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getIsOnline() {
        return isOnline;
    }

    public void setIsOnline(String isOnline) {
        this.isOnline = isOnline;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDivision() {
        return division;
    }

    public void setDivision(String division) {
        this.division = division;
    }

    public String getContactNum() {
        return contactNum;
    }

    public void setContactNum(String contactNum) {
        this.contactNum = contactNum;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMasterName() {
        return masterName;
    }

    public void setMasterName(String masterName) {
        this.masterName = masterName;
    }

    public String getMasterEmail() {
        return masterEmail;
    }

    public void setMasterEmail(String masterEmail) {
        this.masterEmail = masterEmail;
    }

    public String getMasterPhone() {
        return masterPhone;
    }

    public void setMasterPhone(String masterPhone) {
        this.masterPhone = masterPhone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "StationWithMasterDTO{" +
                "stationId='" + stationId + '\'' +
                ", stationName='" + stationName + '\'' +
                ", isOnline='" + isOnline + '\'' +
                ", location='" + location + '\'' +
                ", division='" + division + '\'' +
                ", contactNum='" + contactNum + '\'' +
                ", status='" + status + '\'' +
                ", masterName='" + masterName + '\'' +
                ", masterEmail='" + masterEmail + '\'' +
                ", masterPhone='" + masterPhone + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}
