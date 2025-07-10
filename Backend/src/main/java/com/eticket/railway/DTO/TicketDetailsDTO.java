package com.eticket.railway.DTO;

public class TicketDetailsDTO {
    
    public String bookingId;
    public String trainName;
    public String travelDate;
    public String travelTime;
    public String starting;
    public String destination;
    public String passengerName;
    public String passengerType;
    public String coachName;
    public String className;
    public String seatNum;
    public String berthPosition;
    public String nid;
    public String phoneNum;
    public String email;
    public String fullName;
    public String profileImage; //blob
    public double total;
    public String trxId;
    public TicketDetailsDTO(String bookingId, String trainName, String travelDate, String travelTime, String starting, String destination,
            String passengerName, String passengerType, String coachName, String className, String seatNum,
            String berthPosition, String nid, String phoneNum, String email, String fullName, String profileImage,
            double total, String trxId) {
        this.bookingId = bookingId;
        this.trainName = trainName;
        this.travelDate = travelDate;
        this.travelTime = travelTime;
        this.starting = starting;
        this.destination = destination;
        this.passengerName = passengerName;
        this.passengerType = passengerType;
        this.coachName = coachName;
        this.className = className;
        this.seatNum = seatNum;
        this.berthPosition = berthPosition;
        this.nid = nid;
        this.phoneNum = phoneNum;
        this.email = email;
        this.fullName = fullName;
        this.profileImage = profileImage;
        this.total = total;
        this.trxId = trxId;
    }
    public String getTrainName() {
        return trainName;
    }
    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }
    public String getTravelDate() {
        return travelDate;
    }
    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }
    public String getTravelTime() {
        return travelTime;
    }
    public void setTravelTime(String travelTime) {
        this.travelTime = travelTime;
    }
    public String getStarting() {
        return starting;
    }
    public void setStarting(String starting) {
        this.starting = starting;
    }
    public String getDestination() {
        return destination;
    }
    public void setDestination(String destination) {
        this.destination = destination;
    }
    public String getPassengerName() {
        return passengerName;
    }
    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }
    public String getPassengerType() {
        return passengerType;
    }
    public void setPassengerType(String passengerType) {
        this.passengerType = passengerType;
    }
    public String getCoachName() {
        return coachName;
    }
    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }
    public String getClassName() {
        return className;
    }
    public void setClassName(String className) {
        this.className = className;
    }
    public String getSeatNum() {
        return seatNum;
    }
    public void setSeatNum(String seatNum) {
        this.seatNum = seatNum;
    }
    public String getBerthPosition() {
        return berthPosition;
    }
    public void setBerthPosition(String berthPosition) {
        this.berthPosition = berthPosition;
    }
    public String getNid() {
        return nid;
    }
    public void setNid(String nid) {
        this.nid = nid;
    }
    public String getPhoneNum() {
        return phoneNum;
    }
    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public String getProfileImage() {
        return profileImage;
    }
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
    public double getTotal() {
        return total;
    }
    public void setTotal(double total) {
        this.total = total;
    }
    public String getTrxId() {
        return trxId;
    }
    public void setTrxId(String trxId) {
        this.trxId = trxId;
    }
    public String getBookingId() {
        return bookingId;
    }
    public void setBookingId(String bookingId) {
        this.bookingId = bookingId; 
    }

    

    

    





    
}
