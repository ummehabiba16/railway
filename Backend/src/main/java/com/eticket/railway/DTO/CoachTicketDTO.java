package com.eticket.railway.DTO;

public class CoachTicketDTO {
    // trainId: selectedCoach.trainId || "", // Add trainId from bookingResponse
    //     classId: selectedCoach.classId || "", // Add classId from bookingResponse
    //     date: formattedDate,
    //     coachId: coachId,

    private String trainId;
    private String classId;
    private String date;
    private String coachId;
    private String fromStation;
    private String toStation;
    public CoachTicketDTO(String trainId, String classId, String date, String coachId, String fromStation,
            String toStation) {
        this.trainId = trainId;
        this.classId = classId;
        this.date = date;
        this.coachId = coachId;
        this.fromStation = fromStation;
        this.toStation = toStation;
    }
    public String getTrainId() {
        return trainId;
    }
    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }
    public String getClassId() {
        return classId;
    }
    public void setClassId(String classId) {
        this.classId = classId;
    }
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public String getCoachId() {
        return coachId;
    }
    public void setCoachId(String coachId) {
        this.coachId = coachId;
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
