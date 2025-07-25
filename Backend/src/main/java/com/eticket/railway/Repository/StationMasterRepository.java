package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.StationMasterProfileDTO;
import com.eticket.railway.Entity.StationMaster;

@Repository
public class StationMasterRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean existsById(String masterId) {
        String sql = "SELECT COUNT(*) FROM STATION_MASTER WHERE MasterId = ?";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, masterId);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            System.err.println("Error checking if station master exists: " + e.getMessage());
            return false;
        }
    }

    public void save(StationMaster stationMaster) {
        String sql = "INSERT INTO STATION_MASTER (MasterId, Name, Email, StationId, PhoneNum) VALUES (?, ?, ?, ?, ?)";
        try {
            jdbcTemplate.update(sql, stationMaster.getMasterId(), stationMaster.getName(), 
                               stationMaster.getEmail(), stationMaster.getStationId(), stationMaster.getPhoneNum());
            System.out.println("Station Master saved successfully: " + stationMaster.getMasterId());
        } catch (DataAccessException e) {
            System.err.println("Error saving station master: " + e.getMessage());
            throw new RuntimeException("Failed to save station master", e);
        }
    }

    public StationMaster findByEmail(String email) {
        String sql = "SELECT MasterId, Name, Email, StationId, PhoneNum FROM STATION_MASTER WHERE Email = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                StationMaster stationMaster = new StationMaster();
                stationMaster.setMasterId(rs.getString("MasterId"));
                stationMaster.setName(rs.getString("Name"));
                stationMaster.setEmail(rs.getString("Email"));
                stationMaster.setStationId(rs.getString("StationId"));
                stationMaster.setPhoneNum(rs.getString("PhoneNum"));
                return stationMaster;
            }, email);
        } catch (DataAccessException e) {
            System.out.println("Station Master not found with email: " + email);
            return null;
        }
    }

    public StationMaster findById(String masterId) {
        String sql = "SELECT MasterId, Name, Email, StationId, PhoneNum FROM STATION_MASTER WHERE MasterId = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                StationMaster stationMaster = new StationMaster();
                stationMaster.setMasterId(rs.getString("MasterId"));
                stationMaster.setName(rs.getString("Name"));
                stationMaster.setEmail(rs.getString("Email"));
                stationMaster.setStationId(rs.getString("StationId"));
                stationMaster.setPhoneNum(rs.getString("PhoneNum"));
                return stationMaster;
            }, masterId);
        } catch (DataAccessException e) {
            System.out.println("Station Master not found with ID: " + masterId);
            return null;
        }
    }

    public StationMasterProfileDTO getProfile(String masterId) {
        String sql = """
            SELECT SM.Name, SM.Email, SM.PhoneNum, ST.Name as StationName, ST.Location, ST.Division, ST.ContactNum
            FROM STATION_MASTER SM 
            JOIN STATION ST ON ST.StationId = SM.StationId 
            WHERE SM.MasterId = ?
            """;
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                return new StationMasterProfileDTO(
                    rs.getString("Name"),
                    rs.getString("Email"),
                    rs.getString("PhoneNum"),
                    rs.getString("StationName"),
                    rs.getString("Location"),
                    rs.getString("Division"),
                    rs.getString("ContactNum")
                );
            }, masterId);
        } catch (DataAccessException e) {
            System.out.println("Station Master profile not found for ID: " + masterId);
            return null;
        }
    }
}
