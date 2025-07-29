package com.eticket.railway.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.TrainManagementDTO;

@Repository
public class TrainRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<TrainManagementDTO> findAllTrains() {
        String sql = "SELECT T.TRAINID, T.TRAINNUM, T.TrainName, " +
                    "FS.STATIONID FROMID, FS.NAME FROMSTATION, " +
                    "TS.STATIONID TOID, TS.NAME TOSTATION, T.OFFDAY " +
                    "FROM TRAIN T " +
                    "JOIN STATION FS ON(FS.STATIONID = T.FROMSTATIONID) " +
                    "JOIN STATION TS ON(TS.STATIONID = T.ToStationId)";
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> new TrainManagementDTO(
                rs.getString("TRAINID"),
                rs.getString("TRAINNUM"),
                rs.getString("TrainName"),
                rs.getString("FROMID"),
                rs.getString("FROMSTATION"),
                rs.getString("TOID"),
                rs.getString("TOSTATION"),
                rs.getString("OFFDAY")
            ));
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching trains", e);
        }
    }

    public void updateTrain(String trainId, String trainNum, String trainName, 
                           String fromStationId, String toStationId, String offDay) {
        String sql = "UPDATE TRAIN SET TrainNum = ?, TrainName = ?, FromStationId = ?, ToStationId = ?, OffDay = ? WHERE TrainId = ?";
        
        try {
            jdbcTemplate.update(sql, trainNum, trainName, fromStationId, toStationId, offDay, trainId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error updating train", e);
        }
    }

    public void createTrain(String trainId, String trainNum, String trainName, 
                           String fromStationId, String toStationId, String offDay) {
        String sql = "INSERT INTO TRAIN (TrainId, TrainNum, TrainName, FromStationId, ToStationId, OffDay) VALUES (?, ?, ?, ?, ?, ?)";
        
        try {
            jdbcTemplate.update(sql, trainId, trainNum, trainName, fromStationId, toStationId, offDay);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error creating train", e);
        }
    }

    public String generateTrainId() {
        String sql = "SELECT 'TR' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(TrainId, 3))), 0) + 1, 4, '0') as next_id FROM TRAIN";
        
        try {
            return jdbcTemplate.queryForObject(sql, String.class);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error generating train ID", e);
        }
    }

    public boolean trainNumExists(String trainNum) {
        String sql = "SELECT COUNT(*) FROM TRAIN WHERE TrainNum = ?";
        
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, trainNum);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error checking train number existence", e);
        }
    }

    public boolean trainNumExistsForUpdate(String trainNum, String trainId) {
        String sql = "SELECT COUNT(*) FROM TRAIN WHERE TrainNum = ? AND TrainId != ?";
        
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, trainNum, trainId);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error checking train number existence for update", e);
        }
    }

    public TrainManagementDTO findTrainById(String trainId) {
        String sql = "SELECT T.TRAINID, T.TRAINNUM, T.TrainName, " +
                    "FS.STATIONID FROMID, FS.NAME FROMSTATION, " +
                    "TS.STATIONID TOID, TS.NAME TOSTATION, T.OFFDAY " +
                    "FROM TRAIN T " +
                    "JOIN STATION FS ON(FS.STATIONID = T.FROMSTATIONID) " +
                    "JOIN STATION TS ON(TS.STATIONID = T.ToStationId) " +
                    "WHERE T.TRAINID = ?";
        
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new TrainManagementDTO(
                rs.getString("TRAINID"),
                rs.getString("TRAINNUM"),
                rs.getString("TrainName"),
                rs.getString("FROMID"),
                rs.getString("FROMSTATION"),
                rs.getString("TOID"),
                rs.getString("TOSTATION"),
                rs.getString("OFFDAY")
            ), trainId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching train by ID", e);
        }
    }

    public List<String> findAllTrainNames(){
        String sql = """
            SELECT TrainId || ' - ' || TrainName as TrainInfo
            FROM Train
            ORDER BY TrainId
                """;
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("TrainInfo"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching all train names", e);
        }
    }

    public List<Map<String, String>> getCoachesByTrainId(String trainId) {
        String sql = """
            SELECT C.COACHID, C.COACHNAME 
            FROM TRAIN T JOIN COACH C ON(C.TRAINID = T.TRAINID)
            WHERE T.TRAINID = ?
            ORDER BY C.COACHNAME
                """;
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, String> coach = new HashMap<>();
                coach.put("coachId", rs.getString("COACHID"));
                coach.put("coachName", rs.getString("COACHNAME"));
                return coach;
            }, trainId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching coaches for train", e);
        }
    }

}
