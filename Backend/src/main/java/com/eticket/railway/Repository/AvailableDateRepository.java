package com.eticket.railway.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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

    public void insertAvailableDate(LocalDate travelDate) {
        String sql = "INSERT INTO AVAILABLE_DATES (TravelDate) VALUES (TO_DATE(?, 'DD-MM-YYYY'))";
        
        try {
            String formattedDate = travelDate.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            jdbcTemplate.update(sql, formattedDate);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error inserting available date", e);
        }
    }

    public List<Date> findAllAvailableDates() {
        String sql = "SELECT TravelDate FROM AVAILABLE_DATES";
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getDate("TravelDate"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching available dates", e);
        }
    }



    public boolean dateExists(LocalDate travelDate) {
        String sql = "SELECT COUNT(*) FROM AVAILABLE_DATES WHERE TravelDate = TO_DATE(?, 'DD-MM-YYYY')";
        
        try {
            String formattedDate = travelDate.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, formattedDate);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error checking date existence", e);
        }
    }
    
}
