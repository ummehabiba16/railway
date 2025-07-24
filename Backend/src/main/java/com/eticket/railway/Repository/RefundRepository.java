package com.eticket.railway.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.eticket.railway.Entity.Refund;

@Repository
public class RefundRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String getBankTranIdByBookingId(String bookingId) {
        String sql = """
            SELECT P.TRXID
            FROM BOOKING B 
            JOIN INVOICE I ON (B.BOOKINGID = I.BOOKINGID)
            JOIN PAYMENT P ON (P.INVOICEID = I.INVOICEID)
            WHERE B.BOOKINGID = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, String.class, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error getting bank transaction ID for booking: " + bookingId, e);
        }
    }

    public String getPaymentIdByBookingId(String bookingId) {
        String sql = """
            SELECT P.PAYMENTID
            FROM BOOKING B 
            JOIN INVOICE I ON (B.BOOKINGID = I.BOOKINGID)
            JOIN PAYMENT P ON (P.INVOICEID = I.INVOICEID)
            WHERE B.BOOKINGID = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, String.class, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error getting payment ID for booking: " + bookingId, e);
        }
    }

    public int getTotalAmountByBookingId(String bookingId) {
        String sql = """
            SELECT I.TOTAL
            FROM INVOICE I 
            WHERE I.BOOKINGID = ?
        """;

        try {
            Integer result = jdbcTemplate.queryForObject(sql, Integer.class, bookingId);
            return result != null ? result : 0;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error getting total amount for booking: " + bookingId, e);
        }
    }

    public String getDepartureTimeByBookingId(String bookingId) {
        String sql = """
            SELECT TO_CHAR(DEPARTURETIME, 'HH24:MI:SS') AS DEPARTURE
            FROM ROUTE
            WHERE ROUTESEQUENCE = 1 
            AND TRAINID IN 
            (SELECT SA.TRAINID FROM TICKET T 
            JOIN SEAT_ALLOCATION SA ON (T.TRAINSEATID = SA.TRAINSEATID) 
            WHERE T.BOOKINGID = ?)
        """;

        try {
            return jdbcTemplate.queryForObject(sql, String.class, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error getting departure time for booking: " + bookingId, e);
        }
    }

    public String getTravelDateByBookingId(String bookingId) {
        String sql = """
            SELECT TO_CHAR(TRAVELDATE, 'DD-MM-YYYY') AS TRAVEL_DATE
            FROM BOOKING
            WHERE BOOKINGID = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, String.class, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error getting travel date for booking: " + bookingId, e);
        }
    }

    public Refund save(Refund refund) {
        String sql = """
            INSERT INTO REFUND (PaymentId, BookingId, RefundAmount, RefundStatus, RequestTime, ProcessedTime)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try {
            jdbcTemplate.update(sql,
                    refund.getPaymentId(),
                    refund.getBookingId(),
                    refund.getRefundAmount(),
                    refund.getRefundStatus(),
                    refund.getRequestTime(),
                    refund.getProcessedTime()
            );
            return refund;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error saving refund", e);
        }
    }

    public void updateRefundStatus(String paymentId, String bookingId, String status, String refundRefId) {
        String sql = """
            UPDATE REFUND 
            SET RefundStatus = ?, ProcessedTime = CURRENT_TIMESTAMP, RefundRefId = ?
            WHERE PaymentId = ? AND BookingId = ?
        """;

        try {
            jdbcTemplate.update(sql, status, refundRefId, paymentId, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error updating refund status", e);
        }
    }

    public void updateBookingStatus(String bookingId, String status) {
        String sql = """
            UPDATE BOOKING 
            SET STATUS = ?
            WHERE BOOKINGID = ?
        """;

        try {
            jdbcTemplate.update(sql, status, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error updating booking status", e);
        }
    }

    public Refund findByPaymentIdAndBookingId(String paymentId, String bookingId) {
        String sql = """
            SELECT PaymentId, BookingId, RefundAmount, RefundStatus, RequestTime, ProcessedTime
            FROM REFUND
            WHERE PaymentId = ? AND BookingId = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, new RefundRowMapper(), paymentId, bookingId);
        } catch (DataAccessException e) {
            return null; // Return null if not found
        }
    }

    public Refund findByRefundRefId(String refundRefId) {
        String sql = """
            SELECT PaymentId, BookingId, RefundAmount, RefundStatus, RequestTime, ProcessedTime
            FROM REFUND
            WHERE RefundRefId = ?
        """;

        try {
            return jdbcTemplate.queryForObject(sql, new RefundRowMapper(), refundRefId);
        } catch (DataAccessException e) {
            return null; // Return null if not found
        }
    }

    private static class RefundRowMapper implements RowMapper<Refund> {
        @Override
        public Refund mapRow(@org.springframework.lang.NonNull ResultSet rs, int rowNum) throws SQLException {
            Refund refund = new Refund();
            refund.setPaymentId(rs.getString("PaymentId"));
            refund.setBookingId(rs.getString("BookingId"));
            refund.setRefundAmount(rs.getInt("RefundAmount"));
            refund.setRefundStatus(rs.getString("RefundStatus"));
            refund.setRequestTime(rs.getTimestamp("RequestTime"));
            refund.setProcessedTime(rs.getTimestamp("ProcessedTime"));
            return refund;
        }
    }
}
