package com.eticket.railway.Controller;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eticket.railway.DTO.StationMasterProfileDTO;
import com.eticket.railway.DTO.StationWithMasterDTO;
import com.eticket.railway.DTO.UserTypeDTO;
import com.eticket.railway.Entity.USER_INFO;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;
import com.eticket.railway.Service.UserInfoService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "https://your-frontend-domain.com"})
public class USERINFOCONTROLLER {

    private static final Logger logger = LoggerFactory.getLogger(USERINFOCONTROLLER.class);
    
    private final USER_INFO_REPOSITORY userInfoRepository;
    private final UserInfoService userInfoService;

    @Autowired
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

    @GetMapping("/master/profile/{masterId}")
    public ResponseEntity<?> getStationMasterProfile(@PathVariable String masterId) {
        System.out.println("=== GET STATION MASTER PROFILE ===");
        System.out.println("Master ID: " + masterId);

        try {
            StationMasterProfileDTO stationMasterProfile = userInfoService.getStationMasterProfile(masterId);
            System.out.println("Station Master profile retrieved for ID: " + masterId);
            return ResponseEntity.ok(stationMasterProfile);
        } catch (RuntimeException e) {
            System.err.println("Error getting station master profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Station Master not found", "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error getting station master profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "message", "Error retrieving station master profile"));
        }
    }

    @GetMapping("/user/type/{userId}")
    public ResponseEntity<?> getUserTypeInfo(@PathVariable String userId) {
        System.out.println("=== GET USER TYPE INFO ===");
        System.out.println("User ID: " + userId);

        try {
            UserTypeDTO userType = userInfoService.getUserTypeInfo(userId);
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

            // Handle profile image
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
                    // Convert to base64 for JSON response
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

    // Admin endpoints
    @GetMapping("/admin/stations")
    public ResponseEntity<java.util.List<StationWithMasterDTO>> getAllStationsWithMasters() {
        System.out.println("=== GET ALL STATIONS WITH MASTERS ===");

        try {
            java.util.List<StationWithMasterDTO> stations = userInfoService.getAllStationsWithMasters();
            System.out.println("Retrieved " + stations.size() + " stations");
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            System.err.println("Unexpected error getting stations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Dashboard Statistics Endpoints
    @GetMapping("/admin/stats/trains")
    public ResponseEntity<Map<String, Object>> getTotalTrains() {
        logger.info("=== GET TOTAL TRAINS COUNT ===");
        
        try {
            Integer trainCount = userInfoService.getTotalTrainCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", trainCount);
            response.put("label", "Total Trains");
            logger.info("Total trains count: {}", trainCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting total trains count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/admin/stats/users")
    public ResponseEntity<Map<String, Object>> getTotalUsers() {
        logger.info("=== GET TOTAL USERS COUNT ===");
        
        try {
            Integer userCount = userInfoService.getTotalUserCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", userCount);
            response.put("label", "Total Users");
            logger.info("Total users count: {}", userCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting total users count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/admin/stats/bookings")
    public ResponseEntity<Map<String, Object>> getTotalBookings() {
        logger.info("=== GET TOTAL BOOKINGS COUNT ===");
        
        try {
            Integer bookingCount = userInfoService.getTotalBookingCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", bookingCount);
            response.put("label", "Total Bookings");
            logger.info("Total bookings count: {}", bookingCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting total bookings count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/admin/stats/todays-bookings")
    public ResponseEntity<Map<String, Object>> getTodaysSuccessfulBookings() {
        logger.info("=== GET TODAY'S SUCCESSFUL BOOKINGS COUNT ===");
        
        try {
            Integer todaysBookings = userInfoService.getTodaysSuccessfulBookingCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", todaysBookings);
            response.put("label", "Today's Successful Bookings");
            logger.info("Today's successful bookings count: {}", todaysBookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting today's successful bookings count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/admin/stats/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        logger.info("=== GET DASHBOARD OVERVIEW STATS ===");
        
        try {
            Map<String, Object> overview = new HashMap<>();
            
            // Get all statistics in one call
            Integer trainCount = userInfoService.getTotalTrainCount();
            Integer userCount = userInfoService.getTotalUserCount();
            Integer bookingCount = userInfoService.getTotalBookingCount();
            Integer todaysBookings = userInfoService.getTodaysSuccessfulBookingCount();
            
            overview.put("totalTrains", trainCount);
            overview.put("totalUsers", userCount);
            overview.put("totalBookings", bookingCount);
            overview.put("todaysSuccessfulBookings", todaysBookings);
            
            logger.info("Dashboard overview - Trains: {}, Users: {}, Bookings: {}, Today's: {}", 
                       trainCount, userCount, bookingCount, todaysBookings);
            
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            logger.error("Error getting dashboard overview: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/admin/stations/{stationId}")
    public ResponseEntity<String> updateStationField(
            @PathVariable String stationId,
            @RequestParam String fieldName,
            @RequestParam String value) {
        System.out.println("=== UPDATE STATION FIELD ===");
        System.out.println("Station ID: " + stationId + ", Field: " + fieldName + ", Value: " + value);

        try {
            userInfoService.updateStationField(stationId, fieldName, value);
            return ResponseEntity.ok("Field updated successfully");
        } catch (Exception e) {
            System.err.println("Error updating station field: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update field: " + e.getMessage());
        }
    }

    @GetMapping("/admin/stations/{stationId}/master")
    public ResponseEntity<String> getStationMasterId(@PathVariable String stationId) {
        System.out.println("=== GET STATION MASTER ID ===");
        System.out.println("Station ID: " + stationId);

        try {
            String masterId = userInfoService.getStationMasterId(stationId);
            if (masterId != null) {
                return ResponseEntity.ok(masterId);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error getting station master ID: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/admin/stations/{stationId}/master")
    public ResponseEntity<String> createStationMaster(
            @PathVariable String stationId,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String password) {
        System.out.println("=== CREATE STATION MASTER ===");
        System.out.println("Station ID: " + stationId + ", Name: " + name);

        try {
            userInfoService.createStationMaster(name, stationId, email, phone, password);
            return ResponseEntity.ok("Station master created successfully");
        } catch (Exception e) {
            System.err.println("Error creating station master: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create station master: " + e.getMessage());
        }
    }

    @PostMapping("/admin/stations/{stationId}/station-master")
    public ResponseEntity<Map<String, String>> createStationMasterJson(
            @PathVariable String stationId,
            @RequestBody Map<String, String> masterData) {
        
        Map<String, String> response = new HashMap<>();
        logger.info("=== CREATE STATION MASTER ===");
        logger.info("Station ID: {}, Master data: {}", stationId, masterData);
        
        try {
            String name = masterData.get("name");
            String email = masterData.get("email");
            String phoneNum = masterData.get("phoneNum");
            String password = masterData.get("password");
            
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Station master name is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (email == null || email.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (phoneNum == null || phoneNum.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Phone number is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (password == null || password.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Additional frontend validations
            if (!email.matches("^[\\w\\.-]+@[\\w\\.-]+\\.[\\w]+$")) {
                response.put("status", "error");
                response.put("message", "Invalid email format");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!phoneNum.matches("^\\d{10,14}$")) {
                response.put("status", "error");
                response.put("message", "Phone number must be 10-14 digits");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (password.length() < 6) {
                response.put("status", "error");
                response.put("message", "Password must be at least 6 characters");
                return ResponseEntity.badRequest().body(response);
            }
            
            String masterId = userInfoService.createStationMaster(name, stationId, email, phoneNum, password);
            response.put("status", "success");
            response.put("message", "Station master created successfully");
            response.put("masterId", masterId);
            logger.info("Station master created successfully with ID: {}", masterId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Runtime error creating station master: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Unexpected error creating station master: {}", e.getMessage(), e);
            response.put("status", "error");
            response.put("message", "An unexpected error occurred. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/admin/stations")
    public ResponseEntity<Map<String, String>> createStation(@RequestBody Map<String, String> stationData) {
        Map<String, String> response = new HashMap<>();
        logger.info("=== CREATE STATION ===");
        logger.info("Station data: {}", stationData);
        
        try {
            String name = stationData.get("name");
            String isOnline = stationData.get("isOnline");
            String location = stationData.get("location");
            String division = stationData.get("division");
            String contactNum = stationData.get("contactNum");
            String status = stationData.get("status");
            
            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Station name is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Additional frontend validations
            if (contactNum != null && !contactNum.trim().isEmpty() && !contactNum.matches("^\\d{10,14}$")) {
                response.put("status", "error");
                response.put("message", "Contact number must be 10-14 digits");
                return ResponseEntity.badRequest().body(response);
            }
            
            String stationId = userInfoService.createStation(name, isOnline, location, division, contactNum, status);
            response.put("status", "success");
            response.put("message", "Station created successfully");
            response.put("stationId", stationId);
            logger.info("Station created successfully with ID: {}", stationId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Runtime error creating station: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Unexpected error creating station: {}", e.getMessage(), e);
            response.put("status", "error");
            response.put("message", "An unexpected error occurred. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
