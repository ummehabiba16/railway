package com.eticket.railway.DTO;

public class CoachDTO {
    private String coachId;
    private String trainId;
    private String classId;
    private String className;
    private int seatCount;
    private String coachName;

    // Default constructor
    public CoachDTO() {}

    // Constructor
    public CoachDTO(String coachId, String trainId, String classId, String className, int seatCount, String coachName) {
        this.coachId = coachId;
        this.trainId = trainId;
        this.classId = classId;
        this.className = className;
        this.seatCount = seatCount;
        this.coachName = coachName;
    }

    // Getters and Setters
    public String getCoachId() {
        return coachId;
    }

    public void setCoachId(String coachId) {
        this.coachId = coachId;
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

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public int getSeatCount() {
        return seatCount;
    }

    public void setSeatCount(int seatCount) {
        this.seatCount = seatCount;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }
}
