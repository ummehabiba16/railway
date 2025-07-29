package com.eticket.railway.Repository;

import java.sql.Date;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.RulesDTO;

@Repository
public class RulesRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public RulesDTO getCurrentRules() {
        String sql = """
            SELECT APPLIEDFROM, TICKETAVAILABLEBEFORE, BOOKINGHOLDTIME, 
                   CHILDFAREPERCENTAGE, SERVICE_CHARGE, BEDDING_CHARGE,
                   MONTHLY_BOOKING_LIMIT, BLOCKING_TIME
            FROM BUSINESSRULE
            WHERE APPLIEDFROM = (SELECT MAX(APPLIEDFROM) FROM BUSINESSRULE)
            """;
        
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new RulesDTO(
                rs.getDate("APPLIEDFROM").toLocalDate(),
                rs.getInt("TICKETAVAILABLEBEFORE"),
                rs.getInt("BOOKINGHOLDTIME"),
                rs.getInt("CHILDFAREPERCENTAGE"),
                rs.getInt("SERVICE_CHARGE"),
                rs.getInt("BEDDING_CHARGE"),
                rs.getInt("MONTHLY_BOOKING_LIMIT"),
                rs.getInt("BLOCKING_TIME")
            ));
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching current rules", e);
        }
    }

    public void updateRule(String fieldName, Object value) {
        LocalDate today = LocalDate.now();
        
        // First check if there's already a rule for today
        String checkSql = "SELECT COUNT(*) FROM RULES WHERE APPLIEDFROM = ?";
        try {
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, Date.valueOf(today));
            
            if (count != null && count > 0) {
                // Update existing rule for today
                String updateSql = "UPDATE RULES SET " + fieldName + " = ? WHERE APPLIEDFROM = ?";
                jdbcTemplate.update(updateSql, value, Date.valueOf(today));
            } else {
                // Get current rules first
                RulesDTO currentRules = getCurrentRules();
                if (currentRules == null) {
                    throw new RuntimeException("No existing rules found to copy from");
                }
                
                // Insert new rule with updated field
                String insertSql = """
                    INSERT INTO BUSINESSRULE (APPLIEDFROM, TICKETAVAILABLEBEFORE, BOOKINGHOLDTIME, 
                                     CHILDFAREPERCENTAGE, SERVICE_CHARGE, BEDDING_CHARGE,
                                     MONTHLY_BOOKING_LIMIT, BLOCKING_TIME)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """;
                
                // Set the field value based on fieldName
                Integer ticketAvailableBefore = currentRules.getTicketAvailableBefore();
                Integer bookingHoldTime = currentRules.getBookingHoldTime();
                Integer childFarePercentage = currentRules.getChildFarePercentage();
                Integer serviceCharge = currentRules.getServiceCharge();
                Integer beddingCharge = currentRules.getBeddingCharge();
                Integer monthlyBookingLimit = currentRules.getMonthlyBookingLimit();
                Integer blockingTime = currentRules.getBlockingTime();
                
                switch (fieldName) {
                    case "TICKETAVAILABLEBEFORE":
                        ticketAvailableBefore = (Integer) value;
                        break;
                    case "BOOKINGHOLDTIME":
                        bookingHoldTime = (Integer) value;
                        break;
                    case "CHILDFAREPERCENTAGE":
                        childFarePercentage = (Integer) value;
                        break;
                    case "SERVICE_CHARGE":
                        serviceCharge = (Integer) value;
                        break;
                    case "BEDDING_CHARGE":
                        beddingCharge = (Integer) value;
                        break;
                    case "MONTHLY_BOOKING_LIMIT":
                        monthlyBookingLimit = (Integer) value;
                        break;
                    case "BLOCKING_TIME":
                        blockingTime = (Integer) value;
                        break;
                }
                
                jdbcTemplate.update(insertSql, 
                    Date.valueOf(today),
                    ticketAvailableBefore,
                    bookingHoldTime,
                    childFarePercentage,
                    serviceCharge,
                    beddingCharge,
                    monthlyBookingLimit,
                    blockingTime
                );
            }
        } catch (DataAccessException e) {
            throw new RuntimeException("Error updating rule: " + fieldName, e);
        }
    }
}
