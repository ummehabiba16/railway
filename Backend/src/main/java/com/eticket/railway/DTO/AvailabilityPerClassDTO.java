package com.eticket.railway.DTO;

public class AvailabilityPerClassDTO {
    private String classId;
    private String className;
    private int fare;
    private int availableCount;

    public AvailabilityPerClassDTO(String classId, String className, int fare, int availableCount) {
        this.classId = classId;
        this.className = className;
        this.fare = fare;
        this.availableCount = availableCount;
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

    public int getFare() {
        return fare;
    }

    public void setFare(int fare) {
        this.fare = fare;
    }

    public int getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(int availableCount) {
        this.availableCount = availableCount;
    }
    
    
}
