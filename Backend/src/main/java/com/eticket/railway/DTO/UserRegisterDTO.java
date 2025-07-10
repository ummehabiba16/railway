package com.eticket.railway.DTO;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserRegisterDTO implements UserDetails{
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNum;
    private String nid;
    private String gender;
    private String address;
    private String birthRegNum;
    private String dateOfBirth;
    private String password;
    @Override
    public String getUsername(){
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return the user's role as a GrantedAuthority
        return Collections.singletonList(new SimpleGrantedAuthority("USER"));
    }

    

    public UserRegisterDTO(String address, String birthRegNum, String dateOfBirth, String email, String firstName, String gender, String lastName, String nid, String password, String phoneNum, String profileImage, String userId) {
        this.address = address;
        this.birthRegNum = birthRegNum;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.firstName = firstName;
        this.gender = gender;
        this.lastName = lastName;
        this.nid = nid;
        this.password = password;
        this.phoneNum = phoneNum;
        this.userId = userId;
    }

    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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


    public void setUserId(String userId) {
        this.userId = userId;
    }


    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }


    public void setLastName(String lastName) {
        this.lastName = lastName;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }


    public void setNid(String nid) {
        this.nid = nid;
    }


    public void setGender(String gender) {
        this.gender = gender;
    }


    public void setAddress(String address) {
        this.address = address;
    }


    public void setBirthRegNum(String birthRegNum) {
        this.birthRegNum = birthRegNum;
    }


    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    
    
}
