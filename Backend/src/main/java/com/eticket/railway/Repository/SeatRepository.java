package com.eticket.railway.Repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.SeatDTO;

@Repository
public class SeatRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<SeatDTO> getSeatsByCoachId(String coachId) {
        String sql = """
            SELECT s.SeatId, s.SeatNum, s.BerthPosition, s.CoachId,
                   CASE WHEN sa.SeatId IS NOT NULL THEN 1 ELSE 0 END as IsAllocated
            FROM SEAT s
            LEFT JOIN SEAT_ALLOCATION sa ON s.SeatId = sa.SeatId
            WHERE s.CoachId = ?
            ORDER BY CAST(s.SeatNum AS NUMBER)
            """;
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                return new SeatDTO(
                    rs.getString("SeatId"),
                    rs.getString("SeatNum"),
                    rs.getString("BerthPosition"),
                    rs.getString("CoachId"),
                    rs.getInt("IsAllocated") == 1
                );
            }, coachId);
        } catch (DataAccessException e) {
            System.err.println("Error fetching seats for coach: " + coachId + " - " + e.getMessage());
            throw new RuntimeException("Error fetching seats for coach: " + coachId, e);
        }
    }

    public void addSeat(SeatDTO seat) {
        String sql = "INSERT INTO SEAT (SeatId, SeatNum, BerthPosition, CoachId) VALUES (?, ?, ?, ?)";
        
        try {
            jdbcTemplate.update(sql, 
                seat.getSeatId(),
                seat.getSeatNum(),
                seat.getBerthPosition(),
                seat.getCoachId()
            );
            
            System.out.println("Seat added successfully: " + seat.getSeatId() + 
                             " for Coach: " + seat.getCoachId());
                             
        } catch (Exception e) {
            System.err.println("Error adding seat: " + e.getMessage());
            throw new RuntimeException("Error adding seat: " + e.getMessage(), e);
        }
    }

    public String generateSeatId() {
        String sql = "SELECT 'S' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(SeatId, 2))), 0) + 1, 5, '0') FROM SEAT";
        
        try {
            String seatId = jdbcTemplate.queryForObject(sql, String.class);
            return seatId != null ? seatId : "S00001";
        } catch (Exception e) {
            System.err.println("Error generating seat ID: " + e.getMessage());
            return "S00001";
        }
    }

    public void generateSeatsForCoach(String coachId, int seatCount) {
        try {
            for (int i = 1; i <= seatCount; i++) {
                String seatId = generateSeatId();
                String seatNum = String.valueOf(i);
                String berthPosition = (i % 2 == 1) ? "L" : "H"; // Lower for odd, Higher for even
                
                SeatDTO seat = new SeatDTO(seatId, seatNum, berthPosition, coachId);
                addSeat(seat);
            }
            
            // Update seat count in COACH table
            String updateSql = "UPDATE COACH SET SeatCount = ? WHERE CoachId = ?";
            jdbcTemplate.update(updateSql, seatCount, coachId);
            
            System.out.println("Generated " + seatCount + " seats for coach: " + coachId);
            
        } catch (Exception e) {
            System.err.println("Error generating seats for coach: " + e.getMessage());
            throw new RuntimeException("Error generating seats for coach: " + e.getMessage(), e);
        }
    }
}
