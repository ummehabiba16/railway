package com.eticket.railway.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.ClassDTO;
import com.eticket.railway.DTO.UserBookingResponse;

@Repository
public class BookingRepository {
    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<UserBookingResponse> getBookingsByUser(String userId) {
        String sql = """
                SELECT BOOKINGID, TRAVELDATE, BOOKINGTIME, STATUS
                FROM BOOKING
                WHERE USERID = ?
                ORDER BY BOOKINGTIME DESC
                """;
        try {
            return jdbcTemplate.query(sql, new Object[] { userId }, (rs, rowNum) -> new UserBookingResponse(
                    rs.getString("BOOKINGID"),
                    rs.getString("TRAVELDATE"),
                    rs.getString("BOOKINGTIME"),
                    rs.getString("STATUS")));

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching userBookings", e);

        }

    }

}
