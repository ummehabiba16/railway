package com.eticket.railway.Repository;

import java.security.SecureRandom;
import java.sql.SQLException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.UserRegisterDTO;

@Repository
public class USER_INFO_REPOSITORY {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Optional<UserRegisterDTO> findById(String id) {
        String sql = """
            SELECT USER_INFO.UserId, FirstName, LastName, Email, PhoneNum, NID, Birth_Reg_Num, Gender, Address, Date_of_Birth, PasswordHash
            FROM USER_INFO 
            JOIN LOGIN_CREDENTIALS ON USER_INFO.UserId = LOGIN_CREDENTIALS.UserId 
            WHERE USER_INFO.UserId = ?
        """;

        try {
            UserRegisterDTO user = jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum)
                    -> new UserRegisterDTO(
                            rs.getString("Address"),
                            rs.getString("Birth_Reg_Num"),
                            rs.getString("Date_of_Birth"),
                            rs.getString("Email"),
                            rs.getString("FirstName"),
                            rs.getString("Gender"),
                            rs.getString("LastName"),
                            rs.getString("NID"),
                            rs.getString("PasswordHash"),
                            rs.getString("PhoneNum"),
                            null, // profileImage not in DB
                            rs.getString("UserId")
                    )
            );
            System.out.println("User found: " + user.getEmail());
            return Optional.of(user);
        } catch (Exception e) {
            return Optional.empty(); // If user not found or any DB error
        }
    }

    public UserRegisterDTO findByEmail(String email) {
        String sql = """
            SELECT USER_INFO.UserId, FirstName, LastName, Email, PhoneNum, NID, Birth_Reg_Num, Gender, Address, Date_of_Birth, PasswordHash
            FROM USER_INFO 
            JOIN LOGIN_CREDENTIALS ON USER_INFO.UserId = LOGIN_CREDENTIALS.UserId 
            WHERE USER_INFO.Email = ?
        """;

        try {
            UserRegisterDTO user = jdbcTemplate.queryForObject(sql, new Object[]{email}, (rs, rowNum)
                    -> new UserRegisterDTO(
                            rs.getString("Address"),
                            rs.getString("Birth_Reg_Num"),
                            rs.getString("Date_of_Birth"),
                            rs.getString("Email"),
                            rs.getString("FirstName"),
                            rs.getString("Gender"),
                            rs.getString("LastName"),
                            rs.getString("NID"),
                            rs.getString("PasswordHash"),
                            rs.getString("PhoneNum"),
                            null, // profileImage not in DB
                            rs.getString("UserId")
                    )
            );
            System.out.println("User found by email: " + user.getEmail());
            return user;
        } catch (Exception e) {
            System.out.println("User not found with email: " + email);
            return null; // If user not found or any DB error
        }
    }

    public void create(UserRegisterDTO user) {
        System.out.println("Inside create method, user: " + user.getEmail());
        String generatedUserId = generateUniqueUserId();
        System.out.println("Generated UserId: " + generatedUserId);
        
        try {
            // Convert date string to java.sql.Date
            java.sql.Date sqlDate = null;
            if (user.getDateOfBirth() != null && !user.getDateOfBirth().isBlank()) {
                sqlDate = java.sql.Date.valueOf(user.getDateOfBirth());
            }
            
            String insertUserSql = """
                INSERT INTO USER_INFO (UserId, FirstName, LastName, Email, PhoneNum, NID, Birth_Reg_Num, Gender, Address, Date_of_Birth) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            System.out.println("Executing SQL: " + insertUserSql);
            System.out.println("Parameters: " + generatedUserId + ", " + user.getFirstName() + ", " + user.getLastName() + 
                             ", " + user.getEmail() + ", " + user.getPhoneNum() + ", " + user.getNid() + ", " + 
                             (user.getBirthRegNum().isBlank() ? "NULL" : user.getBirthRegNum()) + ", " + 
                             user.getGender() + ", " + user.getAddress() + ", " + sqlDate);

            jdbcTemplate.update(insertUserSql,
                    generatedUserId,
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhoneNum(),
                    user.getNid(),
                    user.getBirthRegNum().isBlank() ? null : user.getBirthRegNum(),
                    user.getGender(),
                    user.getAddress(),
                    sqlDate
            );

            System.out.println("USER_INFO insert successful");

            String insertLoginSql = """
                INSERT INTO LOGIN_CREDENTIALS (LoginId, UserId, PasswordHash, LoginType, Role) 
                VALUES (sequence4.nextval, ?, ?, ?, ?)
                """;
            
            System.out.println("Inserting into LOGIN_CREDENTIALS for user: " + user.getEmail());
            
            jdbcTemplate.update(insertLoginSql,
                    generatedUserId,
                    user.getPassword(),
                    //hashPassword(user.getPassword()),
                    "email",
                    "USER"
            );
            
            System.out.println("User created successfully: " + user.getEmail());

        } catch (DataAccessException e) {
            System.out.println("DataAccessException caught: " + e.getMessage());
            System.out.println("Root cause: " + e.getRootCause());
            
            Throwable rootCause = e.getRootCause();
            if (rootCause instanceof SQLException sqlEx) {
                String message = sqlEx.getMessage();
                System.out.println("SQLException message: " + message);
                System.out.println("SQLException error code: " + sqlEx.getErrorCode());
                
                if (message.contains("USER_INFO_EMAIL_UK")) {
                    throw new RuntimeException("Email already registered.");
                } else if (message.contains("USER_INFO_PHONE_UK")) {
                    throw new RuntimeException("Phone number already registered.");
                } else if (message.contains("USER_INFO_NID_UK")) {
                    throw new RuntimeException("NID already registered.");
                } else if (message.contains("USER_INFO_BIRTHREG_UK")) {
                    throw new RuntimeException("Birth registration number already registered.");
                } else {
                    throw new RuntimeException("Database error: " + message);
                }
            }
            throw new RuntimeException("Unexpected error during user creation: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("General exception caught: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Unexpected error during user creation: " + e.getMessage());
        }
    }

    private String hashPassword(String rawPassword) {
        return org.springframework.security.crypto.bcrypt.BCrypt.hashpw(rawPassword, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
    }

    private String generateUniqueUserId() {
        String userId;
        do {
            userId = generateUserId();
        } while (jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM USER_INFO WHERE UserId = ?", Integer.class, userId) > 0);
        return userId;
    }

    public com.eticket.railway.Entity.USER_INFO getUserProfile(String userId) {
        String sql = """
            SELECT UserId, FirstName, LastName, Email, PhoneNum, NID, ProfileImage, Gender, Address, Birth_Reg_Num, Date_of_Birth
            FROM USER_INFO 
            WHERE UserId = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String base64Image = ""; // Default to empty string
                java.sql.Blob blob = rs.getBlob("ProfileImage");
                if (blob != null) {
                    try (java.io.InputStream inputStream = blob.getBinaryStream()) {
                        byte[] imageBytes = inputStream.readAllBytes(); // Java 9+
                        base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);
                    } catch (java.io.IOException e) {
                        // Log the error but do not throw
                        System.err.println("Error reading profile image: " + e.getMessage());
                    }
                }

                com.eticket.railway.Entity.USER_INFO userInfo = new com.eticket.railway.Entity.USER_INFO();
                userInfo.setUserId(rs.getString("UserId"));
                userInfo.setFirstName(rs.getString("FirstName"));
                userInfo.setLastName(rs.getString("LastName"));
                userInfo.setEmail(rs.getString("Email"));
                userInfo.setPhoneNum(rs.getString("PhoneNum"));
                userInfo.setNid(rs.getString("NID"));
                userInfo.setProfileImage(base64Image); // Use base64 encoded string
                userInfo.setGender(rs.getString("Gender"));
                userInfo.setAddress(rs.getString("Address"));
                userInfo.setBirthRegNum(rs.getString("Birth_Reg_Num"));
                userInfo.setDateOfBirth(rs.getString("Date_of_Birth"));
                return userInfo;
            }, userId);
        } catch (Exception e) {
            System.err.println("Error getting user profile: " + e.getMessage());
            throw new RuntimeException("User not found");
        }
    }

    public void updateUserProfile(com.eticket.railway.Entity.USER_INFO userInfo) {
        String sql = """
            UPDATE USER_INFO 
            SET FirstName = ?, LastName = ?, Email = ?, PhoneNum = ?, NID = ?, 
                ProfileImage = ?, Gender = ?, Address = ?, Birth_Reg_Num = ?
            WHERE UserId = ?
        """;

        try {
            // Convert Base64 string back to bytes for BLOB storage
            byte[] imageBytes = null;
            if (userInfo.getProfileImage() != null && !userInfo.getProfileImage().trim().isEmpty()) {
                try {
                    imageBytes = java.util.Base64.getDecoder().decode(userInfo.getProfileImage());
                } catch (IllegalArgumentException e) {
                    System.err.println("Invalid Base64 image data: " + e.getMessage());
                    // Keep imageBytes as null if Base64 is invalid
                }
            }

            int rowsAffected = jdbcTemplate.update(sql,
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getEmail(),
                userInfo.getPhoneNum(),
                userInfo.getNid(),
                imageBytes, // Store raw bytes in BLOB, not Base64 string
                userInfo.getGender(),
                userInfo.getAddress(),
                userInfo.getBirthRegNum(),
                userInfo.getUserId()
            );

            if (rowsAffected == 0) {
                throw new RuntimeException("User not found or no changes made");
            }
        } catch (DataAccessException e) {
            System.err.println("Error updating user profile: " + e.getMessage());
            if (e.getMessage().contains("unique constraint")) {
                if (e.getMessage().contains("EMAIL")) {
                    throw new RuntimeException("Email already exists");
                } else if (e.getMessage().contains("PHONENUM")) {
                    throw new RuntimeException("Phone number already exists");
                } else if (e.getMessage().contains("NID")) {
                    throw new RuntimeException("NID already exists");
                } else if (e.getMessage().contains("BIRTH_REG_NUM")) {
                    throw new RuntimeException("Birth registration number already exists");
                }
            }
            throw new RuntimeException("Error updating profile: " + e.getMessage());
        }
    }

    private String generateUserId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(10);
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}