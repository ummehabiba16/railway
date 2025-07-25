package com.eticket.railway.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("ADMIN")
public class Admin {
    
    @Id
    private String adminId;
    private String adminName;
    private String email;

    public Admin() {
    }

    public Admin(String adminId, String adminName, String email) {
        this.adminId = adminId;
        this.adminName = adminName;
        this.email = email;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "adminId='" + adminId + '\'' +
                ", adminName='" + adminName + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
