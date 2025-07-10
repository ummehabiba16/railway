// package com.eticket.railway.Repository;

// import java.security.SecureRandom;
// import java.sql.SQLException;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.dao.DataAccessException;
// import org.springframework.jdbc.core.JdbcTemplate;
// import org.springframework.stereotype.Repository;

// import com.eticket.railway.DTO.UserRegisterDTO;

// @Repository
// public class USER_INFO_REPOSITORY {

//     @Autowired
//     private JdbcTemplate jdbcTemplate;

//     public Optional<UserRegisterDTO> findById(String id) {
//         String sql = """
//             SELECT USER_INFO.UserId, FirstName, LastName, Email, PhoneNum, NID, Birth_Reg_Num, Gender, Address, Date_of_Birth, PasswordHash
//             FROM USER_INFO 
//             JOIN LOGIN_CREDENTIALS ON USER_INFO.UserId = LOGIN_CREDENTIALS.UserId 
//             WHERE USER_INFO.UserId = ?
//         """;

//         try {
//             UserRegisterDTO user = jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum)
//                     -> new UserRegisterDTO(
//                             rs.getString("Address"),
//                             rs.getString("Birth_Reg_Num"),
//                             rs.getString("Date_of_Birth"),
//                             rs.getString("Email"),
//                             rs.getString("FirstName"),
//                             rs.getString("Gender"),
//                             rs.getString("LastName"),
//                             rs.getString("NID"),
//                             rs.getString("PasswordHash"),
//                             rs.getString("PhoneNum"),
//                             null, // profileImage not in DB
//                             rs.getString("UserId")
//                     )
//             );
//             System.out.println("User found: " + user.getEmail());
//             return Optional.of(user);
//         } catch (Exception e) {
//             return Optional.empty(); // If user not found or any DB error
//         }
//     }

//     public void create(UserRegisterDTO user) {
//         System.out.println("Inside create method, user: " + user.getEmail());
//         String generatedUserId = generateUniqueUserId();
//         System.out.println("Generated UserId: " + generatedUserId);
//         try {
//             java.sql.Date sqlDate = null;
//         if (user.getDateOfBirth() != null && !user.getDateOfBirth().isBlank()) {
//             sqlDate = java.sql.Date.valueOf(user.getDateOfBirth());
//         }
//             String insertUserSql = """
//                 INSERT INTO USER_INFO (UserId, FirstName, LastName, Email, PhoneNum, NID, Birth_Reg_Num, Gender, Address, Date_of_Birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TO_DATE(?, 'YYYY-MM-DD')) 
//                 """;
//             System.out.println("Executing SQL: " + insertUserSql);

//             jdbcTemplate.update(insertUserSql,
//                     generatedUserId,
//                     user.getFirstName(),
//                     user.getLastName(),
//                     user.getEmail(),
//                     user.getPhoneNum(),
//                     user.getNid(),
//                     user.getBirthRegNum().isBlank() ? null : user.getBirthRegNum(),
//                     user.getGender(),
//                     user.getAddress(),
//                     //user.getBirthRegNum(),
//                     sqlDate
//             );

//             String insertLoginSql = """
//                     INSERT INTO LOGIN_CREDENTIALS (LoginId, UserId, PasswordHash, LoginType, Role) VALUES (sequence4.nextval, ?, ?, ?, ?)
//                     """;
//             System.out.println("Inserting into LOGIN_CREDENTIALS for user: " + user.getEmail());
//             jdbcTemplate.update(insertLoginSql,
//                     generatedUserId,
//                     hashPassword(user.getPassword()),
//                     "email",
//                     "USER"
//             );
//             System.out.println("User created successfully: " + user.getEmail());

//         } catch (DataAccessException e) {
//             System.out.println("DataAccessException caught: " + e.getMessage());
//             System.out.println("Root cause: " + e.getRootCause());
//             Throwable rootCause = e.getRootCause();
//             if (rootCause instanceof SQLException sqlEx) {
//                 String message = sqlEx.getMessage();
//                 if (message.contains("USER_INFO_EMAIL_UK")) {
//                     throw new RuntimeException("Email already registered.");
//                 } else if (message.contains("USER_INFO_PHONE_UK")) {
//                     throw new RuntimeException("Phone number already registered.");
//                 } else if (message.contains("USER_INFO_NID_UK")) {
//                     throw new RuntimeException("NID already registered.");
//                 } else if (message.contains("USER_INFO_BIRTHREG_UK")) {
//                     throw new RuntimeException("Birth registration number already registered.");
//                 } else {
//                     throw new RuntimeException("Database error: " + message);
//                 }
//             }
//             throw new RuntimeException("Unexpected error during user creation.");
//         } catch (Exception e) {
//             System.out.println("General exception caught: " + e.getMessage());
//             e.printStackTrace();
//             throw new RuntimeException("Unexpected error during user creation: " + e.getMessage());
//         }

//     }

//     private String hashPassword(String rawPassword) {
//         return org.springframework.security.crypto.bcrypt.BCrypt.hashpw(rawPassword, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
//     }

//     private String generateUniqueUserId() {
//         String userId;
//         do {
//             userId = generateUserId();
//         } while (jdbcTemplate.queryForObject(
//                 "SELECT COUNT(*) FROM USER_INFO WHERE UserId = ?", Integer.class, userId) > 0);
//         return userId;
//     }

//     private String generateUserId() {
//         String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//         StringBuilder sb = new StringBuilder(10);
//         SecureRandom random = new SecureRandom();
//         for (int i = 0; i < 10; i++) {
//             sb.append(chars.charAt(random.nextInt(chars.length())));
//         }
//         return sb.toString();
//     }

// }
