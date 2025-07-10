package com.eticket.railway.Repository;

import java.sql.Date;
import java.util.List;

import org.springframework.dao.DataAccessException; //**** */
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AvailableDateRepository {
    private final JdbcTemplate jdbcTemplate;
    public AvailableDateRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Date> findAllAvailableDates() {
        String sql = "SELECT TravelDate FROM AVAILABLE_DATES";
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getDate("TravelDate"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching available dates", e);
        }
    }
    
}
