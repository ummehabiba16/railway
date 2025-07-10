package com.eticket.railway.DTO;

public class TrainIDDTO {
    private String trainId;
    private String trainName;
    private String trainNum;

    public TrainIDDTO(String trainId, String trainName, String trainNum) {
        this.trainId = trainId;
        this.trainName = trainName;
        this.trainNum = trainNum;
    }
    public String getTrainId() {
        return trainId;
    }
    public void setTrainId(String trainId) {
        this.trainId = trainId;
    }
    public String getTrainName() {
        return trainName;
    }
    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }
    public String getTrainNum() {
        return trainNum;
    }
    public void setTrainNum(String trainNum) {
        this.trainNum = trainNum;
    }
}
