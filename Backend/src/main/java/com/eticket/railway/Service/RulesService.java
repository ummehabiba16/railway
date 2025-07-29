package com.eticket.railway.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.RulesDTO;
import com.eticket.railway.Repository.RulesRepository;

@Service
public class RulesService {

    @Autowired
    private RulesRepository rulesRepository;

    public RulesDTO getCurrentRules() {
        RulesDTO rules = rulesRepository.getCurrentRules();
        if (rules == null) {
            throw new RuntimeException("No rules found in the system");
        }
        return rules;
    }

    @Transactional
    public void updateTicketAvailableBefore(Integer value) {
        validatePositiveValue(value, "Ticket Available Before");
        if (value > 90) {
            throw new RuntimeException("Ticket Available Before cannot exceed 90 days");
        }
        rulesRepository.updateRule("TICKETAVAILABLEBEFORE", value);
    }

    @Transactional
    public void updateBookingHoldTime(Integer value) {
        validatePositiveValue(value, "Booking Hold Time");
        if (value > 999) {
            throw new RuntimeException("Booking Hold Time cannot exceed 999 minutes");
        }
        rulesRepository.updateRule("BOOKINGHOLDTIME", value);
    }

    @Transactional
    public void updateChildFarePercentage(Integer value) {
        validatePositiveValue(value, "Child Fare Percentage");
        if (value > 100) {
            throw new RuntimeException("Child Fare Percentage cannot exceed 100%");
        }
        rulesRepository.updateRule("CHILDFAREPERCENTAGE", value);
    }

    @Transactional
    public void updateServiceCharge(Integer value) {
        validatePositiveValue(value, "Service Charge");
        if (value > 999) {
            throw new RuntimeException("Service Charge cannot exceed 999");
        }
        rulesRepository.updateRule("SERVICE_CHARGE", value);
    }

    @Transactional
    public void updateBeddingCharge(Integer value) {
        validatePositiveValue(value, "Bedding Charge");
        if (value > 999) {
            throw new RuntimeException("Bedding Charge cannot exceed 999");
        }
        rulesRepository.updateRule("BEDDING_CHARGE", value);
    }

    @Transactional
    public void updateMonthlyBookingLimit(Integer value) {
        validatePositiveValue(value, "Monthly Booking Limit");
        if (value > 999) {
            throw new RuntimeException("Monthly Booking Limit cannot exceed 999");
        }
        rulesRepository.updateRule("MONTHLY_BOOKING_LIMIT", value);
    }

    @Transactional
    public void updateBlockingTime(Integer value) {
        validatePositiveValue(value, "Blocking Time");
        if (value > 999) {
            throw new RuntimeException("Blocking Time cannot exceed 999 minutes");
        }
        rulesRepository.updateRule("BLOCKING_TIME", value);
    }

    private void validatePositiveValue(Integer value, String fieldName) {
        if (value == null) {
            throw new RuntimeException(fieldName + " cannot be null");
        }
        if (value < 0) {
            throw new RuntimeException(fieldName + " cannot be negative");
        }
    }
}
