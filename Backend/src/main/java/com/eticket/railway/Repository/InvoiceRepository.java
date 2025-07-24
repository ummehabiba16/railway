package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.Entity.Invoice;

@Repository
public class InvoiceRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Invoice save(Invoice invoice) {
        String sql = """
            INSERT INTO INVOICE (InvoiceId, BookingId, BaseFare, Vat, ServiceCharge, BeddingCharge, Total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

        try {
            jdbcTemplate.update(sql,
                    invoice.getInvoiceId(),
                    invoice.getBookingId(),
                    invoice.getBaseFare(),
                    invoice.getVat(),
                    invoice.getServiceCharge(),
                    invoice.getBeddingCharge(),
                    invoice.getTotal()
            );
            return invoice;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error saving invoice", e);
        }
    }

    public Invoice findByBookingId(String bookingId) {
        String sql = "SELECT * FROM INVOICE WHERE BookingId = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{bookingId}, (rs, rowNum) -> {
                Invoice invoice = new Invoice();
                invoice.setInvoiceId(rs.getString("InvoiceId"));
                invoice.setBookingId(rs.getString("BookingId"));
                invoice.setBaseFare(rs.getDouble("BaseFare"));
                invoice.setVat(rs.getDouble("Vat"));
                invoice.setServiceCharge(rs.getDouble("ServiceCharge"));
                invoice.setBeddingCharge(rs.getDouble("BeddingCharge"));
                invoice.setTotal(rs.getDouble("Total"));
                return invoice;
            });
        } catch (DataAccessException e) {
            throw new RuntimeException("Error finding invoice by booking ID", e);
        }
    }

    public void deleteByBookingId(String bookingId) {
        String sql = "DELETE FROM INVOICE WHERE BookingId = ?";
        try {
            jdbcTemplate.update(sql, bookingId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error deleting invoice by booking ID", e);
        }
    }
    
}
