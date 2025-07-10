package com.eticket.railway.DTO;

public class AvailabilityDTO {
    private String className;
    private int fare;
    private int availableCount;
    
    public AvailabilityDTO(String className, int fare, int availableCount) {
        this.className = className;
        this.fare = fare;
        this.availableCount = availableCount;
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
