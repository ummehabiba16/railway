package com.eticket.railway.Repository;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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

    public String findHoldTime(String bookingId) {
        String sql = """
                SELECT TO_CHAR(MIN(BOOKINGHOLDUNTIL), 'YYYY-MM-DD HH24:MI:SS')AS HOLDTIME
                FROM TICKET
                WHERE BOOKINGID = ?
                """;
        
        try {
            return jdbcTemplate.queryForObject(sql, String.class, bookingId);
        } catch (DataAccessException e) {
            System.err.println("Error fetching hold time for booking: " + bookingId + " - " + e.getMessage());
            throw new RuntimeException("Error fetching booking hold time", e);
        }
    }

    public boolean updateBooking(String nid, String bookingId) {
        String sql = """
                UPDATE BOOKING
                SET SoldBy = 'S', NID = ?
                WHERE BOOKINGID = ?
                """;
        
        try {
            int rowsAffected = jdbcTemplate.update(sql, nid, bookingId);
            return rowsAffected > 0;
        } catch (DataAccessException e) {
            System.err.println("Error updating booking: " + bookingId + " - " + e.getMessage());
            throw new RuntimeException("Error updating booking", e);
        }
    }

}
