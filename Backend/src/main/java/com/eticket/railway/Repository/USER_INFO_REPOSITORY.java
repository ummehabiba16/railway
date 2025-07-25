package com.eticket.railway.Repository;

import java.security.SecureRandom;
import java.sql.SQLException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.UserRegisterDTO;
import com.eticket.railway.DTO.UserTypeDTO;

@Repository
public class USER_INFO_REPOSITORY {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    // Create a local instance to avoid circular dependency
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();    public Optional<UserRegisterDTO> findById(String id) {
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
        return passwordEncoder.encode(rawPassword);
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

    public UserTypeDTO getUserTypeInfo(String userId) {
        String sql = """
            SELECT 
                FIRSTNAME || ' ' || LASTNAME AS FULLNAME,
                CASE 
                    WHEN FLOOR(MONTHS_BETWEEN(SYSDATE, DATE_OF_BIRTH) / 12) >= 18 THEN 'A'
                    ELSE 'C'
                END AS TYPE
            FROM USER_INFO
            WHERE USERID = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                UserTypeDTO userType = new UserTypeDTO();
                userType.setFullName(rs.getString("FULLNAME"));
                userType.setType(rs.getString("TYPE"));
                return userType;
            }, userId);
        } catch (Exception e) {
            System.err.println("Error getting user type info: " + e.getMessage());
            throw new RuntimeException("User not found");
        }
    }

    public String getBanStatus(String userId) {
        String sql = """
            SELECT 
            CASE 
                WHEN MAX(BOOKINGTIME) > CURRENT_TIMESTAMP - INTERVAL '5' MINUTE THEN
                    LPAD(
                        FLOOR(
                            (300 - EXTRACT(SECOND FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) - EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 60 - EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 3600) / 60
                        ), 
                        1, '0'
                    ) || ':' || 
                    LPAD(
                        MOD(
                            FLOOR(300 - EXTRACT(SECOND FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) - EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 60 - EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - MAX(BOOKINGTIME))) * 3600), 
                            60
                        ), 
                        2, '0'
                    )
                ELSE
                    'NOT_BANNED'
            END AS TIME_REMAINING
        FROM BOOKING
        WHERE USERID = ?
        """;


        try {
            String result = jdbcTemplate.queryForObject(sql, String.class, userId);
            System.out.println("DEBUG: Ban check for user " + userId + " - Result: " + result);
            return result != null ? result : "NOT_BANNED";
        } catch (Exception e) {
            System.err.println("Error checking ban status for user: " + userId + " - " + e.getMessage());
            return "NOT_BANNED"; // User not banned or doesn't exist
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

    public java.util.List<com.eticket.railway.DTO.StationWithMasterDTO> getAllStationsWithMasters() {
        String sql = """
            SELECT ST.StationId, ST.Name, 
                   (CASE ST.isOnline WHEN 'Y' THEN 'ONLINE' ELSE 'NOT ONLINE' END) as OnlineStatus, 
                   ST.Location, ST.Division, ST.ContactNum, ST.Status, 
                   SM.Name as MasterName, SM.Email, SM.PhoneNum, LC.PasswordHash
            FROM STATION ST 
            LEFT OUTER JOIN STATION_MASTER SM ON (ST.StationId = SM.StationId)
            LEFT OUTER JOIN LOGIN_CREDENTIALS LC ON (LC.MasterId = SM.MasterId)
            ORDER BY ST.Name
            """;
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                com.eticket.railway.DTO.StationWithMasterDTO station = new com.eticket.railway.DTO.StationWithMasterDTO();
                station.setStationId(rs.getString("StationId"));
                station.setStationName(rs.getString("Name"));
                station.setIsOnline(rs.getString("OnlineStatus"));
                station.setLocation(rs.getString("Location"));
                station.setDivision(rs.getString("Division"));
                station.setContactNum(rs.getString("ContactNum"));
                station.setStatus(rs.getString("Status"));
                station.setMasterName(rs.getString("MasterName"));
                station.setMasterEmail(rs.getString("Email"));
                station.setMasterPhone(rs.getString("PhoneNum"));
                
                // Convert passwordHash to a placeholder password for display
                String passwordHash = rs.getString("PasswordHash");
                if (passwordHash != null && !passwordHash.trim().isEmpty()) {
                    // For security, don't return actual password, just indicate it exists
                    station.setPassword("password123"); // This could be made configurable
                } else {
                    station.setPassword(null);
                }
                
                return station;
            });
        } catch (DataAccessException e) {
            System.err.println("Error fetching stations with masters: " + e.getMessage());
            throw new RuntimeException("Failed to fetch stations data", e);
        }
    }

    public void updateStationField(String stationId, String fieldName, String value) {
        String sql = "";
        switch (fieldName.toLowerCase()) {
            case "stationname":
                sql = "UPDATE STATION SET NAME = ? WHERE STATIONID = ?";
                break;
            case "isonline":
                sql = "UPDATE STATION SET ISONLINE = ? WHERE STATIONID = ?";
                break;
            case "location":
                sql = "UPDATE STATION SET LOCATION = ? WHERE STATIONID = ?";
                break;
            case "division":
                sql = "UPDATE STATION SET DIVISION = ? WHERE STATIONID = ?";
                break;
            case "contactnum":
                sql = "UPDATE STATION SET CONTACTNUM = ? WHERE STATIONID = ?";
                break;
            case "status":
                sql = "UPDATE STATION SET STATUS = ? WHERE STATIONID = ?";
                break;
            case "mastername":
                sql = "UPDATE STATION_MASTER SET NAME = ? WHERE STATIONID = ?";
                break;
            case "masteremail":
                sql = "UPDATE STATION_MASTER SET EMAIL = ? WHERE STATIONID = ?";
                break;
            case "masterphone":
                sql = "UPDATE STATION_MASTER SET PHONENUM = ? WHERE STATIONID = ?";
                break;
            case "password":
                // Update password in LOGIN_CREDENTIALS table
                sql = "UPDATE LOGIN_CREDENTIALS SET PASSWORDHASH = ? WHERE MASTERID = (SELECT MASTERID FROM STATION_MASTER WHERE STATIONID = ?)";
                // Hash the password before storing (in production, use BCrypt)
                value = hashPassword(value);
                break;
            default:
                throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }
        
        jdbcTemplate.update(sql, value, stationId);
    }

    public String getStationMasterId(String stationId) {
        try {
            String sql = "SELECT MASTERID FROM STATION_MASTER WHERE STATIONID = ?";
            return jdbcTemplate.queryForObject(sql, String.class, stationId);
        } catch (Exception e) {
            return null; // No station master found
        }
    }

    public void createStationMaster(String masterId, String name, String stationId, String email, String phone, String password) {
        try {
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                throw new RuntimeException("Station master name is required");
            }
            if (stationId == null || stationId.trim().isEmpty()) {
                throw new RuntimeException("Station ID is required");
            }
            if (email == null || email.trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (phone == null || phone.trim().isEmpty()) {
                throw new RuntimeException("Phone number is required");
            }
            if (password == null || password.trim().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            
            // Validate email format
            if (!email.matches("^[\\w\\.-]+@[\\w\\.-]+\\.[\\w]+$")) {
                throw new RuntimeException("Invalid email format");
            }
            
            // Validate phone format
            if (!phone.matches("^\\d{10,14}$")) {
                throw new RuntimeException("Phone number must be 10-14 digits");
            }
            
            // Check if station exists
            if (!stationIdExists(stationId)) {
                throw new RuntimeException("Station does not exist: " + stationId);
            }
            
            // Check if station already has a master
            String existingMasterId = getStationMasterId(stationId);
            if (existingMasterId != null) {
                throw new RuntimeException("Station already has a master assigned");
            }
            
            // Check if email already exists
            String checkEmailSql = "SELECT COUNT(*) FROM STATION_MASTER WHERE EMAIL = ?";
            Integer emailCount = jdbcTemplate.queryForObject(checkEmailSql, Integer.class, email);
            if (emailCount != null && emailCount > 0) {
                throw new RuntimeException("Email already exists");
            }
            
            // Hash the password before storing
            String hashedPassword = hashPassword(password);
            
            // Insert into STATION_MASTER
            String insertMasterSql = "INSERT INTO STATION_MASTER (MASTERID, NAME, STATIONID, EMAIL, PHONENUM) VALUES (?, ?, ?, ?, ?)";
            jdbcTemplate.update(insertMasterSql, masterId, name, stationId, email, phone);
            
            // Insert into LOGIN_CREDENTIALS
            String insertLoginSql = "INSERT INTO LOGIN_CREDENTIALS (LOGINID, MASTERID, LOGINTYPE, PASSWORDHASH, ROLE) VALUES (?, ?, 'STATION_MASTER', ?, 'STATION_MASTER')";
            jdbcTemplate.update(insertLoginSql, masterId, masterId, hashedPassword);
            
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to create station master: " + e.getMessage());
        }
    }

    public String generateStationMasterId() {
        try {
            String sql = "SELECT 'SM' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(MASTERID, 3))), 0) + 1, 4, '0') FROM STATION_MASTER WHERE MASTERID LIKE 'SM%'";
            return jdbcTemplate.queryForObject(sql, String.class);
        } catch (Exception e) {
            return "SM0001"; // Default if no masters exist
        }
    }

    public String generateMasterId() {
        return generateStationMasterId();
    }

    public String generateStationId(String stationName) {
        try {
            // Generate abbreviation from station name (max 6 chars)
            String baseId = stationName.toUpperCase()
                    .replaceAll("[^A-Z]", "") // Remove non-alphabetic characters
                    .substring(0, Math.min(stationName.replaceAll("[^A-Z]", "").length(), 4)); // Take first 4 letters
            
            if (baseId.length() < 2) {
                baseId = stationName.toUpperCase().substring(0, Math.min(stationName.length(), 4));
            }
            
            // Check if base ID exists, if so add numbers
            String finalId = baseId;
            int counter = 1;
            
            while (stationIdExists(finalId)) {
                finalId = baseId + String.format("%02d", counter);
                if (finalId.length() > 6) {
                    // If too long, truncate base and try again
                    baseId = baseId.substring(0, Math.max(1, baseId.length() - 1));
                    finalId = baseId + String.format("%02d", counter);
                }
                counter++;
                if (counter > 99) {
                    throw new RuntimeException("Cannot generate unique station ID");
                }
            }
            
            return finalId;
        } catch (Exception e) {
            throw new RuntimeException("Error generating station ID: " + e.getMessage());
        }
    }

    private boolean stationIdExists(String stationId) {
        try {
            String sql = "SELECT COUNT(*) FROM STATION WHERE STATIONID = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, stationId);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public void createStation(String stationId, String name, String isOnline, String location, 
                             String division, String contactNum, String status) {
        try {
            // Validate station ID uniqueness first
            if (stationIdExists(stationId)) {
                throw new RuntimeException("Station ID already exists: " + stationId);
            }
            
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                throw new RuntimeException("Station name is required");
            }
            
            String sql = "INSERT INTO STATION (STATIONID, NAME, ISONLINE, LOCATION, DIVISION, CONTACTNUM, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, stationId, name, isOnline, location, division, contactNum, status);
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to create station: " + e.getMessage());
        }
    }

    // Dashboard Statistics Methods
    public Integer getTotalTrainCount() {
        try {
            String sql = "SELECT COUNT(TRAINID) FROM TRAIN";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total train count: " + e.getMessage());
        }
    }

    public Integer getTotalUserCount() {
        try {
            String sql = "SELECT COUNT(USERID) FROM USER_INFO";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total user count: " + e.getMessage());
        }
    }

    public Integer getTotalBookingCount() {
        try {
            String sql = "SELECT COUNT(BOOKINGID) FROM BOOKING WHERE BOOKINGTIME IS NOT NULL";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total booking count: " + e.getMessage());
        }
    }

    public Integer getTodaysSuccessfulBookingCount() {
        try {
            String sql = "SELECT COUNT(*) FROM BOOKING WHERE TRUNC(BOOKINGTIME) = TRUNC(SYSDATE) AND STATUS = 'SUCCESSFUL'";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get today's successful booking count: " + e.getMessage());
        }
    }
}