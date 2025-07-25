package com.eticket.railway.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.StationMasterProfileDTO;
import com.eticket.railway.DTO.StationWithMasterDTO;
import com.eticket.railway.DTO.UserTypeDTO;
import com.eticket.railway.Repository.StationMasterRepository;
import com.eticket.railway.Repository.USER_INFO_REPOSITORY;

@Service
public class UserInfoService {

    @Autowired
    private USER_INFO_REPOSITORY userInfoRepository;

    @Autowired
    private StationMasterRepository stationMasterRepository;

    public UserTypeDTO getUserTypeInfo(String userId) {
        return userInfoRepository.getUserTypeInfo(userId);
    }

    public String getBanStatus(String userId) {
        return userInfoRepository.getBanStatus(userId);
    }

    public StationMasterProfileDTO getStationMasterProfile(String masterId) {
        return stationMasterRepository.getProfile(masterId);
    }

    public java.util.List<StationWithMasterDTO> getAllStationsWithMasters() {
        return userInfoRepository.getAllStationsWithMasters();
    }

    public void updateStationField(String stationId, String fieldName, String value) {
        userInfoRepository.updateStationField(stationId, fieldName, value);
    }

    public String getStationMasterId(String stationId) {
        return userInfoRepository.getStationMasterId(stationId);
    }

    @Transactional
    public String createStationMaster(String name, String stationId, String email, String phoneNum, String password) {
        try {
            // Validate inputs first
            if (name == null || name.trim().isEmpty()) {
                throw new RuntimeException("Station master name is required");
            }
            if (stationId == null || stationId.trim().isEmpty()) {
                throw new RuntimeException("Station ID is required");
            }
            if (email == null || email.trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (phoneNum == null || phoneNum.trim().isEmpty()) {
                throw new RuntimeException("Phone number is required");
            }
            if (password == null || password.trim().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            
            // Generate unique master ID
            String masterId = userInfoRepository.generateMasterId();
            
            // Create station master (password encoding and validation is handled in repository)
            userInfoRepository.createStationMaster(masterId, name, stationId, email, phoneNum, password);
            
            return masterId;
        } catch (Exception e) {
            // Re-throw to ensure transaction rollback
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to create station master: " + e.getMessage());
        }
    }

    @Transactional
    public String createStation(String name, String isOnline, String location, String division, String contactNum, String status) {
        try {
            // Validate inputs first
            if (name == null || name.trim().isEmpty()) {
                throw new RuntimeException("Station name is required");
            }
            
            // Set defaults for optional fields
            if (isOnline == null || isOnline.trim().isEmpty()) {
                isOnline = "Y";
            }
            if (status == null || status.trim().isEmpty()) {
                status = "ACTIVE";
            }
            
            // Validate enum values
            if (!isOnline.equals("Y") && !isOnline.equals("N")) {
                throw new RuntimeException("isOnline must be 'Y' or 'N'");
            }
            if (!status.equals("ACTIVE") && !status.equals("INACTIVE")) {
                throw new RuntimeException("Status must be 'ACTIVE' or 'INACTIVE'");
            }
            
            // Validate contact number format if provided
            if (contactNum != null && !contactNum.trim().isEmpty() && !contactNum.matches("^\\d{10,14}$")) {
                throw new RuntimeException("Contact number must be 10-14 digits");
            }
            
            // Generate unique station ID
            String stationId = userInfoRepository.generateStationId(name);
            
            // Create station
            userInfoRepository.createStation(stationId, name, isOnline, location, division, contactNum, status);
            
            return stationId;
        } catch (Exception e) {
            // Re-throw to ensure transaction rollback
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to create station: " + e.getMessage());
        }
    }

    // Dashboard Statistics Methods
    public Integer getTotalTrainCount() {
        try {
            return userInfoRepository.getTotalTrainCount();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total train count: " + e.getMessage());
        }
    }

    public Integer getTotalUserCount() {
        try {
            return userInfoRepository.getTotalUserCount();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total user count: " + e.getMessage());
        }
    }

    public Integer getTotalBookingCount() {
        try {
            return userInfoRepository.getTotalBookingCount();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get total booking count: " + e.getMessage());
        }
    }

    public Integer getTodaysSuccessfulBookingCount() {
        try {
            return userInfoRepository.getTodaysSuccessfulBookingCount();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get today's successful booking count: " + e.getMessage());
        }
    }

    public Map<String, Integer> getDashboardOverview() {
        try {
            Map<String, Integer> overview = new HashMap<>();
            overview.put("totalTrains", userInfoRepository.getTotalTrainCount());
            overview.put("totalUsers", userInfoRepository.getTotalUserCount());
            overview.put("totalBookings", userInfoRepository.getTotalBookingCount());
            overview.put("todaysSuccessfulBookings", userInfoRepository.getTodaysSuccessfulBookingCount());
            return overview;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get dashboard overview: " + e.getMessage());
        }
    }
}
