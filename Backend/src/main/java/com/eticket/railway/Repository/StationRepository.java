package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.StationDTO;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.dao.DataAccessException;

@Repository
public class StationRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<StationDTO> findAllFromStations() {
        String sql = "SELECT StationId, Name FROM STATION WHERE isOnline = 'Y' AND status = 'ACTIVE'";

        return jdbcTemplate.query(sql, new RowMapper<StationDTO>() {
            @Override
            public StationDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                return new StationDTO(rs.getString("StationId"), rs.getString("Name"));
            }
        });
    }

    public List<StationDTO> findAllFromStationsStationMaster() {
        String sql = "SELECT StationId, Name FROM STATION WHERE status = 'ACTIVE'";

        return jdbcTemplate.query(sql, new RowMapper<StationDTO>() {
            @Override
            public StationDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                return new StationDTO(rs.getString("StationId"), rs.getString("Name"));
            }
        });
    }

    public List<StationDTO> findAllToStations() {
        String sql = "SELECT StationId, Name FROM STATION WHERE status = 'ACTIVE'";
        try{
        return jdbcTemplate.query(sql, new RowMapper<StationDTO>() {
            @Override
            public StationDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                return new StationDTO(rs.getString("StationId"), rs.getString("Name"));
            }
        });
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching stations", e);
    
        }
    }
}
