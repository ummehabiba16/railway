package com.eticket.railway.Repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.SeatAllocationDTO;

@Repository
public class SeatAllocationRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void addSeatAllocation(SeatAllocationDTO allocation) {
        String sql = """
            INSERT INTO SEAT_ALLOCATION (TrainSeatId, SeatId, TrainId, FromStationId, ToStationId, ClassId, Fare)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        
        try {
            jdbcTemplate.update(sql, 
                allocation.getTrainSeatId(),
                allocation.getSeatId(),
                allocation.getTrainId(),
                allocation.getFromStationId(),
                allocation.getToStationId(),
                allocation.getClassId(),
                allocation.getFare()
            );
            
            System.out.println("Seat allocation added successfully: " + allocation.getTrainSeatId());
                             
        } catch (Exception e) {
            System.err.println("Error adding seat allocation: " + e.getMessage());
            throw new RuntimeException("Error adding seat allocation: " + e.getMessage(), e);
        }
    }

    public String generateTrainSeatId() {
        String sql = "SELECT 'TS' || LPAD(NVL(MAX(TO_NUMBER(SUBSTR(TrainSeatId, 3))), 0) + 1, 4, '0') FROM SEAT_ALLOCATION";
        
        try {
            String trainSeatId = jdbcTemplate.queryForObject(sql, String.class);
            return trainSeatId != null ? trainSeatId : "TS0001";
        } catch (Exception e) {
            System.err.println("Error generating train seat ID: " + e.getMessage());
            return "TS0001";
        }
    }

    public List<SeatAllocationDTO> getSeatAllocationsByTrainId(String trainId) {
        String sql = """
            SELECT sa.TrainSeatId, sa.SeatId, sa.TrainId, sa.FromStationId, sa.ToStationId, sa.ClassId, sa.Fare,
                   fs.Name as FromStationName, ts.Name as ToStationName, c.ClassName
            FROM SEAT_ALLOCATION sa
            JOIN STATION fs ON sa.FromStationId = fs.StationId
            JOIN STATION ts ON sa.ToStationId = ts.StationId
            JOIN CLASS c ON sa.ClassId = c.ClassId
            WHERE sa.TrainId = ?
            ORDER BY sa.TrainSeatId
            """;
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                return new SeatAllocationDTO(
                    rs.getString("TrainSeatId"),
                    rs.getString("SeatId"),
                    rs.getString("TrainId"),
                    rs.getString("FromStationId"),
                    rs.getString("ToStationId"),
                    rs.getString("ClassId"),
                    rs.getDouble("Fare")
                );
            }, trainId);
        } catch (DataAccessException e) {
            System.err.println("Error fetching seat allocations for train: " + trainId + " - " + e.getMessage());
            throw new RuntimeException("Error fetching seat allocations for train: " + trainId, e);
        }
    }

    public boolean seatAllocationExists(String seatId, String fromStationId, String toStationId) {
        String sql = "SELECT COUNT(*) FROM SEAT_ALLOCATION WHERE SeatId = ? AND FromStationId = ? AND ToStationId = ?";
        
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, seatId, fromStationId, toStationId);
            return count != null && count > 0;
        } catch (Exception e) {
            System.err.println("Error checking seat allocation existence: " + e.getMessage());
            return false;
        }
    }

    public void addBulkSeatAllocations(List<SeatAllocationDTO> allocations) {
        String sql = """
            INSERT INTO SEAT_ALLOCATION (TrainSeatId, SeatId, TrainId, FromStationId, ToStationId, ClassId, Fare)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        
        try {
            jdbcTemplate.batchUpdate(sql, allocations, allocations.size(), (ps, allocation) -> {
                ps.setString(1, allocation.getTrainSeatId());
                ps.setString(2, allocation.getSeatId());
                ps.setString(3, allocation.getTrainId());
                ps.setString(4, allocation.getFromStationId());
                ps.setString(5, allocation.getToStationId());
                ps.setString(6, allocation.getClassId());
                ps.setDouble(7, allocation.getFare());
            });
            
            System.out.println("Bulk seat allocations added successfully: " + allocations.size() + " records");
                             
        } catch (Exception e) {
            System.err.println("Error adding bulk seat allocations: " + e.getMessage());
            throw new RuntimeException("Error adding bulk seat allocations: " + e.getMessage(), e);
        }
    }
}
