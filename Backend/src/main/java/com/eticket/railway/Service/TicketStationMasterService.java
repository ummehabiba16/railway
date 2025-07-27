package com.eticket.railway.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.TicketDetailsStationMasterDTO;
import com.eticket.railway.Repository.TicketStationMasterRepository;

@Service
public class TicketStationMasterService {

    @Autowired
    private TicketStationMasterRepository ticketStationMasterRepository;

    /**
     * Get ticket details for station master view
     * This method returns limited information suitable for station masters
     * without sensitive user data like profile images, phone numbers, etc.
     * 
     * @param bookingId The booking ID to get ticket details for
     * @return List of ticket details suitable for station master view
     */
    public List<TicketDetailsStationMasterDTO> getTicketDetailsByBookingId(String bookingId) {
        try {
            List<TicketDetailsStationMasterDTO> tickets = ticketStationMasterRepository.findByBookingIdStationMaster(bookingId);
            
            if (tickets == null || tickets.isEmpty()) {
                throw new RuntimeException("No tickets found for booking ID: " + bookingId);
            }
            
            return tickets;
            
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving ticket details for station master: " + e.getMessage(), e);
        }
    }

    /**
     * Get ticket details for station master view by payment ID
     * This method returns limited information suitable for station masters
     * without sensitive user data like profile images, phone numbers, etc.
     * 
     * @param paymentId The payment ID to get ticket details for
     * @return List of ticket details suitable for station master view
     */
    public List<TicketDetailsStationMasterDTO> getTicketDetailsByPaymentId(String paymentId) {
        try {
            List<TicketDetailsStationMasterDTO> tickets = ticketStationMasterRepository.findByPaymentIdStationMaster(paymentId);
            
            if (tickets == null || tickets.isEmpty()) {
                throw new RuntimeException("No tickets found for payment ID: " + paymentId);
            }
            
            return tickets;
            
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving ticket details for station master: " + e.getMessage(), e);
        }
    }

    /**
     * Validate if a booking exists and has tickets
     * 
     * @param bookingId The booking ID to validate
     * @return true if booking has tickets, false otherwise
     */
    public boolean validateBookingExists(String bookingId) {
        try {
            List<TicketDetailsStationMasterDTO> tickets = ticketStationMasterRepository.findByBookingIdStationMaster(bookingId);
            return tickets != null && !tickets.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}
