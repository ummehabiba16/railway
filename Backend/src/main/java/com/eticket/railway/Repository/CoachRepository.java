package com.eticket.railway.Repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.CoachDTO;

@Repository
public class CoachRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<CoachDTO> getCoachesByTrainId(String trainId) {
        String sql = """
            SELECT c.CoachId, c.TrainId, c.ClassId, cl.ClassName, c.SeatCount, c.CoachName
            FROM COACH c
            JOIN CLASS cl ON c.ClassId = cl.ClassId
            WHERE c.TrainId = ?
            ORDER BY c.CoachName
            """;
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                return new CoachDTO(
                    rs.getString("CoachId"),
                    rs.getString("TrainId"),
                    rs.getString("ClassId"),
                    rs.getString("ClassName"),
                    rs.getInt("SeatCount"),
                    rs.getString("CoachName")
                );
            }, trainId);
        } catch (DataAccessException e) {
            System.err.println("Error fetching coaches for train: " + trainId + " - " + e.getMessage());
            throw new RuntimeException("Error fetching coaches for train: " + trainId, e);
        }
    }

    public void addCoach(CoachDTO coach) {
        String sql = "INSERT INTO COACH (CoachId, TrainId, ClassId, SeatCount, CoachName) VALUES (?, ?, ?, ?, ?)";
        
        try {
            jdbcTemplate.update(sql, 
                coach.getCoachId(),
                coach.getTrainId(),
                coach.getClassId(),
                coach.getSeatCount(),
                coach.getCoachName()
            );
            
            System.out.println("Coach added successfully: " + coach.getCoachId() + 
                             " for Train: " + coach.getTrainId());
                             
        } catch (Exception e) {
            System.err.println("Error adding coach: " + e.getMessage());
            throw new RuntimeException("Error adding coach: " + e.getMessage(), e);
        }
    }

    public String generateCoachId() {
        String sql = "SELECT 'C' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(CoachId, 2))), 0) + 1, 5, '0') FROM COACH";
        
        try {
            String coachId = jdbcTemplate.queryForObject(sql, String.class);
            return coachId != null ? coachId : "C00001";
        } catch (Exception e) {
            System.err.println("Error generating coach ID: " + e.getMessage());
            return "C00001";
        }
    }

    public List<String> getAllClassIds() {
        String sql = "SELECT ClassId FROM CLASS ORDER BY ClassId";
        
        try {
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (DataAccessException e) {
            System.err.println("Error fetching class IDs: " + e.getMessage());
            throw new RuntimeException("Error fetching class IDs", e);
        }
    }

    public List<CoachDTO> getAllClasses() {
        String sql = "SELECT ClassId, ClassName FROM CLASS ORDER BY ClassId";
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                CoachDTO classInfo = new CoachDTO();
                classInfo.setClassId(rs.getString("ClassId"));
                classInfo.setClassName(rs.getString("ClassName"));
                return classInfo;
            });
        } catch (DataAccessException e) {
            System.err.println("Error fetching classes: " + e.getMessage());
            throw new RuntimeException("Error fetching classes", e);
        }
    }
}
