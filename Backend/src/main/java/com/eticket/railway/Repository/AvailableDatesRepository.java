package com.eticket.railway.Repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AvailableDatesRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    

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
