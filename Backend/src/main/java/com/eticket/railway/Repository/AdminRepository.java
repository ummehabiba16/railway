package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.Entity.Admin;

@Repository
public class AdminRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean existsById(String adminId) {
        String sql = "SELECT COUNT(*) FROM ADMIN WHERE AdminId = ?";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, adminId);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            System.err.println("Error checking if admin exists: " + e.getMessage());
            return false;
        }
    }

    public void save(Admin admin) {
        String sql = "INSERT INTO ADMIN (AdminId, AdminName, Email) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(sql, admin.getAdminId(), admin.getAdminName(), admin.getEmail());
            System.out.println("Admin saved successfully: " + admin.getAdminId());
        } catch (DataAccessException e) {
            System.err.println("Error saving admin: " + e.getMessage());
            throw new RuntimeException("Failed to save admin", e);
        }
    }

    public Admin findByEmail(String email) {
        String sql = "SELECT AdminId, AdminName, Email FROM ADMIN WHERE Email = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Admin admin = new Admin();
                admin.setAdminId(rs.getString("AdminId"));
                admin.setAdminName(rs.getString("AdminName"));
                admin.setEmail(rs.getString("Email"));
                return admin;
            }, email);
        } catch (DataAccessException e) {
            System.out.println("Admin not found with email: " + email);
            return null;
        }
    }

    public Admin findById(String adminId) {
        String sql = "SELECT AdminId, AdminName, Email FROM ADMIN WHERE AdminId = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Admin admin = new Admin();
                admin.setAdminId(rs.getString("AdminId"));
                admin.setAdminName(rs.getString("AdminName"));
                admin.setEmail(rs.getString("Email"));
                return admin;
            }, adminId);
        } catch (DataAccessException e) {
            System.out.println("Admin not found with ID: " + adminId);
            return null;
        }
    }
}
