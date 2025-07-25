package com.eticket.railway.DTO;

public class UserTypeDTO {
    private String fullName;
    private String type;

    public UserTypeDTO() {}

    public UserTypeDTO(String fullName, String type) {
        this.fullName = fullName;
        this.type = type;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "UserTypeDTO{" +
                "fullName='" + fullName + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
