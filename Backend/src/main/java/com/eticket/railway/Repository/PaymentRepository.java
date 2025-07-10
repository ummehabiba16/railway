package com.eticket.railway.Repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.Entity.Payment;

@Repository
public class PaymentRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    public Payment save(Payment payment) {
        String sql = """
            INSERT INTO PAYMENT (PaymentId, TrxId, PaymentMode, Status, PaymentTime, InvoiceId)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try {
            jdbcTemplate.update(sql,
                    payment.getPaymentId(),
                    payment.getTrxId(),
                    payment.getPaymentMode(),
                    payment.getStatus(),
                    payment.getPaymentTime(),
                    payment.getInvoiceId()
            );
            return payment;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error saving payment", e);
        }
    }
    public void update(String invoiceId) {
        String sql = "CALL COMPLETE_BOOKING(?)"; // or "{call COMPLETE_BOOKING(?)}" if you're using CallableStatement directly
    
        try {
            jdbcTemplate.update(sql, invoiceId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Error COMPLETING payment", e);
        }
    }
    

    
}
