package com.eticket.railway.Repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.RouteDTO;

@Repository
public class RouteRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void addRoute(RouteDTO route) {
        String sql = """
            INSERT INTO ROUTE (TrainId, FromStationId, ArrivalTime, DepartureTime, Halt, RouteDuration, RouteSequence, IsActive, ActiveSince)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """;
        
        try {
            // Convert time strings to TIMESTAMP objects if they're not null
            Timestamp arrivalTimestamp = null;
            Timestamp departureTimestamp = null;
            
            if (route.getArrivalTime() != null && !route.getArrivalTime().trim().isEmpty()) {
                arrivalTimestamp = Timestamp.valueOf("1970-01-01 " + route.getArrivalTime() + ":00");
            }
            
            if (route.getDepartureTime() != null && !route.getDepartureTime().trim().isEmpty()) {
                departureTimestamp = Timestamp.valueOf("1970-01-01 " + route.getDepartureTime() + ":00");
            }
            
            jdbcTemplate.update(sql, 
                route.getTrainId(),
                route.getFromStationId(),
                arrivalTimestamp,
                departureTimestamp,
                route.getHalt(),
                route.getRouteDuration(),
                route.getRouteSequence(),
                route.getIsActive()
            );
            
            System.out.println("Route added successfully for Train: " + route.getTrainId() + 
                             ", Station: " + route.getFromStationId() + 
                             ", Sequence: " + route.getRouteSequence());
                             
        } catch (Exception e) {
            System.err.println("Error adding route: " + e.getMessage());
            throw new RuntimeException("Error adding route: " + e.getMessage(), e);
        }
    }

    public List<RouteDTO> getRoutesByTrainId(String trainId) {
        String sql = """
            SELECT r.TrainId, r.FromStationId, s.Name as StationName,
                   TO_CHAR(r.ArrivalTime, 'HH24:MI') as ArrivalTime,
                   TO_CHAR(r.DepartureTime, 'HH24:MI') as DepartureTime,
                   r.Halt, r.RouteDuration, r.RouteSequence, r.IsActive
            FROM ROUTE r
            JOIN STATION s ON r.FromStationId = s.StationId
            WHERE r.TrainId = ? AND r.IsActive = 'Y'
            ORDER BY r.RouteSequence
            """;
        
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                RouteDTO route = new RouteDTO();
                route.setTrainId(rs.getString("TrainId"));
                route.setFromStationId(rs.getString("FromStationId"));
                route.setStationName(rs.getString("StationName"));
                route.setArrivalTime(rs.getString("ArrivalTime"));
                route.setDepartureTime(rs.getString("DepartureTime"));
                route.setHalt(rs.getInt("Halt"));
                route.setRouteDuration(rs.getInt("RouteDuration"));
                route.setRouteSequence(rs.getInt("RouteSequence"));
                route.setIsActive(rs.getString("IsActive"));
                return route;
            }, trainId);
        } catch (DataAccessException e) {
            System.err.println("Error fetching routes for train: " + trainId + " - " + e.getMessage());
            throw new RuntimeException("Error fetching routes for train: " + trainId, e);
        }
    }

    public boolean routeSequenceExists(String trainId, int routeSequence) {
        String sql = "SELECT COUNT(*) FROM ROUTE WHERE TrainId = ? AND RouteSequence = ? AND IsActive = 'Y'";
        
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, trainId, routeSequence);
            return count != null && count > 0;
        } catch (Exception e) {
            System.err.println("Error checking route sequence existence: " + e.getMessage());
            return false;
        }
    }

    public int getMaxRouteSequence(String trainId) {
        String sql = "SELECT COALESCE(MAX(RouteSequence), 0) FROM ROUTE WHERE TrainId = ? AND IsActive = 'Y'";
        
        try {
            Integer maxSequence = jdbcTemplate.queryForObject(sql, Integer.class, trainId);
            return maxSequence != null ? maxSequence : 0;
        } catch (Exception e) {
            System.err.println("Error getting max route sequence: " + e.getMessage());
            return 0;
        }
    }
}
