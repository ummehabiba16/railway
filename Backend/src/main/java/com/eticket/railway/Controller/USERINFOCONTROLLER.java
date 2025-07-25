package com.eticket.railway.Controller;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eticket.railway.Entity.USER_INFO;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;
import com.eticket.railway.Service.UserInfoService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "https://your-frontend-domain.com"})
public class USERINFOCONTROLLER {

    private final USER_INFO_REPOSITORY userInfoRepository;
    private final UserInfoService userInfoService;

    public USERINFOCONTROLLER(USER_INFO_REPOSITORY userInfoRepository, UserInfoService userInfoService) {
        this.userInfoRepository = userInfoRepository;
        this.userInfoService = userInfoService;
    }

    @GetMapping("/user/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        System.out.println("=== GET USER PROFILE ===");
        System.out.println("User ID: " + userId);

        try {
            USER_INFO userInfo = userInfoRepository.getUserProfile(userId);
            System.out.println("Profile retrieved for user: " + userId);
            return ResponseEntity.ok(userInfo);
        } catch (RuntimeException e) {
            System.err.println("Error getting user profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found", "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error getting user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Error retrieving profile"));
        }
    }

    @GetMapping("/user/type/{userId}")
    public ResponseEntity<?> getUserTypeInfo(@PathVariable String userId) {
        System.out.println("=== GET USER TYPE INFO ===");
        System.out.println("User ID: " + userId);

        try {
            com.eticket.railway.DTO.UserTypeDTO userType = userInfoService.getUserTypeInfo(userId);
            System.out.println("User type info retrieved for user: " + userId);
            return ResponseEntity.ok(userType);
        } catch (RuntimeException e) {
            System.err.println("Error getting user type info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found", "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error getting user type info: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Error retrieving user type info"));
        }
    }

    @GetMapping("/user/banned/{userId}")
    public ResponseEntity<?> getUserBannedStatus(@PathVariable String userId) {
        System.out.println("=== GET USER BAN STATUS ===");
        System.out.println("User ID: " + userId);

        try {
            String banStatus = userInfoService.getBanStatus(userId);
            System.out.println("Ban status for user " + userId + ": " + banStatus);
            
            if (!"NOT_BANNED".equals(banStatus)) {
                // User is banned - return remaining time
                return ResponseEntity.ok(Map.of(
                    "bannedUntil", banStatus,
                    "status", "BANNED"
                ));
            } else {
                // User is not banned
                return ResponseEntity.ok(Map.of(
                    "bannedUntil", "NOT_BANNED",
                    "status", "NOT_BANNED"
                ));
            }
        } catch (Exception e) {
            System.err.println("Unexpected error getting user ban status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Error retrieving ban status"));
        }
    }

    @PutMapping("/user/profile")
    public ResponseEntity<?> updateUserProfile(
            @RequestParam String userId,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phoneNum,
            @RequestParam(required = false) String nid,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String birthRegNum,
            @RequestParam(required = false) String dateOfBirth,
            @RequestParam(required = false) MultipartFile profileImage) {

        System.out.println("=== UPDATE USER PROFILE ===");
        System.out.println("User ID: " + userId);

        try {
            // Get current user info first
            USER_INFO userInfo = userInfoRepository.getUserProfile(userId);
            
            // Update only provided fields
            if (firstName != null && !firstName.trim().isEmpty()) {
                userInfo.setFirstName(firstName.trim());
            }
            if (lastName != null && !lastName.trim().isEmpty()) {
                userInfo.setLastName(lastName.trim());
            }
            
            // Email cannot be changed (security rule)
            if (email != null && !email.equals(userInfo.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email cannot be changed", "message", "Email cannot be modified for security reasons"));
            }
            
            // Phone number cannot be changed (security rule)
            if (phoneNum != null && !phoneNum.equals(userInfo.getPhoneNum())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Phone number cannot be changed", "message", "Phone number cannot be modified for security reasons"));
            }
            
            // Birth registration number cannot be changed
            if (birthRegNum != null && !birthRegNum.equals(userInfo.getBirthRegNum())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Birth registration number cannot be changed", "message", "Birth registration number cannot be modified"));
            }
            
            // Date of birth cannot be changed (immutable field)
            if (dateOfBirth != null && !dateOfBirth.equals(userInfo.getDateOfBirth())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Date of birth cannot be changed", "message", "Date of birth cannot be modified"));
            }
            
            // NID business rules
            if (nid != null && !nid.trim().isEmpty()) {
                // Check if user is 18 or older
                if (!isUserAdult(userInfo.getDateOfBirth())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Age restriction", "message", "You must be 18 or older to set NID"));
                }
                
                // Check if NID is already set
                if (userInfo.getNid() != null && !userInfo.getNid().trim().isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "NID cannot be changed", "message", "NID cannot be modified once set"));
                }
                
                userInfo.setNid(nid.trim());
            }
            
            if (gender != null && !gender.trim().isEmpty()) {
                userInfo.setGender(gender.trim());
            }
            if (address != null && !address.trim().isEmpty()) {
                userInfo.setAddress(address.trim());
            }
            // Note: dateOfBirth is immutable and should never be updated

            // Handle profile image
            // NOTE: For production, consider storing images in cloud storage (AWS S3, Cloudinary)
            // and saving only the URL in database instead of BLOB for better performance
            if (profileImage != null && !profileImage.isEmpty()) {
                try {
                    // Validate file size (5MB limit)
                    if (profileImage.getSize() > 5 * 1024 * 1024) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "File too large", "message", "Image size should be less than 5MB"));
                    }

                    // Validate file type
                    String contentType = profileImage.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid file type", "message", "Only image files are allowed"));
                    }

                    // Store raw bytes for BLOB database column
                    byte[] imageBytes = profileImage.getBytes();
                    // Convert to base64 for JSON response (Entity still uses String)
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                    userInfo.setProfileImage(base64Image);
                    
                    System.out.println("Profile image updated for user: " + userId);
                } catch (Exception e) {
                    System.err.println("Error processing profile image: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Error processing image", "message", e.getMessage()));
                }
            }

            // Update in database
            userInfoRepository.updateUserProfile(userInfo);
            
            System.out.println("Profile updated successfully for user: " + userId);
            return ResponseEntity.ok(userInfo);

        } catch (RuntimeException e) {
            System.err.println("Error updating user profile: " + e.getMessage());
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Duplicate data", "message", e.getMessage()));
            } else if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found", "message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Update failed", "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error updating user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Error updating profile"));
        }
    }

    private boolean isUserAdult(String dateOfBirth) {
        if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) {
            return false;
        }
        
        try {
            // Parse the date string - assuming format YYYY-MM-DD
            LocalDate birthDate = LocalDate.parse(dateOfBirth.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDate today = LocalDate.now();
            
            // Calculate age
            Period age = Period.between(birthDate, today);
            return age.getYears() >= 18;
            
        } catch (DateTimeParseException e) {
            System.err.println("Error parsing date of birth: " + dateOfBirth + " - " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error calculating age: " + e.getMessage());
            return false;
        }
    }
}
