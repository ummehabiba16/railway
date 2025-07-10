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
    
}
