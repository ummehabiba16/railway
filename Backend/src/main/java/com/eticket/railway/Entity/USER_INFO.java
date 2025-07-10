package com.eticket.railway.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("USER_INFO")
public class USER_INFO {
    private @Id String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNum;
    private String nid;
    private String profileImage;
    private String gender;
    private String address;
    private String birthRegNum;
    private String dateOfBirth;

    public USER_INFO() {
    }

    public USER_INFO(String userId, String firstName, String lastName, String email, String phoneNum, String nid,
            String profileImage, String gender, String address, String birthRegNum, String dateOfBirth) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNum = phoneNum;
        this.nid = nid;
        this.profileImage = profileImage;
        this.gender = gender;
        this.address = address;
        this.birthRegNum = birthRegNum;
        this.dateOfBirth = dateOfBirth;
    }

    public String getUserId() {
        return userId;
    }

    public String getName(){
        return firstName+" "+lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public String getNid() {
        return nid;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public String getGender() {
        return gender;
    }

    public String getAddress() {
        return address;
    }

    public String getBirthRegNum() {
        return birthRegNum;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }
    
    
    
}
