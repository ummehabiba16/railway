package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LoginCredentialsRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void save(String loginId, String userId, String adminId, String masterId, 
                     String loginType, String passwordHash, String role) {
        String sql = """
            INSERT INTO LOGIN_CREDENTIALS (LoginId, UserId, AdminId, MasterId, LoginType, PasswordHash, Role) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        try {
            jdbcTemplate.update(sql, loginId, userId, adminId, masterId, loginType, passwordHash, role);
            System.out.println("Login credentials saved successfully for: " + 
                (userId != null ? userId : (adminId != null ? adminId : masterId)));
        } catch (DataAccessException e) {
            System.err.println("Error saving login credentials: " + e.getMessage());
            throw new RuntimeException("Failed to save login credentials", e);
        }
    }

    public LoginCredential findByEmail(String email) {
        String sql = """
            SELECT lc.LoginId, lc.UserId, lc.AdminId, lc.MasterId, lc.LoginType, lc.PasswordHash, lc.Role,
                   ui.Email as UserEmail, a.Email as AdminEmail, sm.Email as StationMasterEmail
            FROM LOGIN_CREDENTIALS lc
            LEFT JOIN USER_INFO ui ON lc.UserId = ui.UserId
            LEFT JOIN ADMIN a ON lc.AdminId = a.AdminId
            LEFT JOIN STATION_MASTER sm ON lc.MasterId = sm.MasterId
            WHERE ui.Email = ? OR a.Email = ? OR sm.Email = ?
            """;
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                LoginCredential credential = new LoginCredential();
                credential.setLoginId(rs.getString("LoginId"));
                credential.setUserId(rs.getString("UserId"));
                credential.setAdminId(rs.getString("AdminId"));
                credential.setMasterId(rs.getString("MasterId"));
                credential.setLoginType(rs.getString("LoginType"));
                credential.setPasswordHash(rs.getString("PasswordHash"));
                credential.setRole(rs.getString("Role"));
                
                // Set email from whichever source is not null
                String userEmail = rs.getString("UserEmail");
                String adminEmail = rs.getString("AdminEmail");
                String stationMasterEmail = rs.getString("StationMasterEmail");
                
                if (userEmail != null) {
                    credential.setEmail(userEmail);
                } else if (adminEmail != null) {
                    credential.setEmail(adminEmail);
                } else if (stationMasterEmail != null) {
                    credential.setEmail(stationMasterEmail);
                }
                
                return credential;
            }, email, email, email);
        } catch (DataAccessException e) {
            System.out.println("Login credentials not found for email: " + email);
            return null;
        }
    }

    public static class LoginCredential {
        private String loginId;
        private String userId;
        private String adminId;
        private String masterId;
        private String loginType;
        private String passwordHash;
        private String role;
        private String email;

        // Getters and setters
        public String getLoginId() { return loginId; }
        public void setLoginId(String loginId) { this.loginId = loginId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getAdminId() { return adminId; }
        public void setAdminId(String adminId) { this.adminId = adminId; }

        public String getMasterId() { return masterId; }
        public void setMasterId(String masterId) { this.masterId = masterId; }

        public String getLoginType() { return loginType; }
        public void setLoginType(String loginType) { this.loginType = loginType; }

        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
