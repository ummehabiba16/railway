package com.eticket.railway.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.TicketDetailsStationMasterDTO;
import com.eticket.railway.Service.TicketStationMasterService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketStationMasterController {

    @Autowired
    private TicketStationMasterService ticketStationMasterService;

    /**
     * Get ticket details for station master view
     * This endpoint provides limited ticket information suitable for station masters
     * without sensitive user data
     * 
     * @param request containing bookingId
     * @return List of ticket details for station master view
     */
    @PostMapping("/ticket/stationmaster/booking")
    public ResponseEntity<?> getTicketDetailsByBookingId(@RequestBody BookingRequest request) {
        try {
            if (request.getBookingId() == null || request.getBookingId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Booking ID is required");
            }

            List<TicketDetailsStationMasterDTO> tickets = ticketStationMasterService.getTicketDetailsByBookingId(request.getBookingId());
            
            return ResponseEntity.ok(tickets);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("No tickets found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tickets found for the provided booking ID");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving ticket details: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    /**
     * Get full ticket details for station master view by payment ID
     * This endpoint provides limited ticket information suitable for station masters
     * without sensitive user data
     * 
     * @param request containing paymentId
     * @return List of ticket details for station master view
     */
    @PostMapping("/stationmaster/ticket")
    public ResponseEntity<?> getFullDetailsStationMaster(@RequestBody PaymentRequest request) {
        try {
            if (request.getPaymentId() == null || request.getPaymentId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Payment ID is required");
            }

            List<TicketDetailsStationMasterDTO> tickets = ticketStationMasterService.getTicketDetailsByPaymentId(request.getPaymentId());
            
            if (tickets.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tickets found for the given payment ID");
            }
            
            return ResponseEntity.ok(tickets);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("No tickets found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tickets found for the provided payment ID");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving ticket details: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * Validate if a booking exists
     * 
     * @param request containing bookingId
     * @return validation result
     */
    @PostMapping("/ticket/stationmaster/validate")
    public ResponseEntity<?> validateBooking(@RequestBody BookingRequest request) {
        try {
            if (request.getBookingId() == null || request.getBookingId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Booking ID is required");
            }

            boolean exists = ticketStationMasterService.validateBookingExists(request.getBookingId());
            
            if (exists) {
                return ResponseEntity.ok().body("{\"valid\": true, \"message\": \"Booking exists\"}");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"valid\": false, \"message\": \"Booking not found\"}");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"valid\": false, \"message\": \"Error validating booking\"}");
        }
    }

    // Request DTO for booking operations
    public static class BookingRequest {
        private String bookingId;

        public BookingRequest() {
        }

        public BookingRequest(String bookingId) {
            this.bookingId = bookingId;
        }

        public String getBookingId() {
            return bookingId;
        }

        public void setBookingId(String bookingId) {
            this.bookingId = bookingId;
        }
    }

    // Request DTO for payment operations
    public static class PaymentRequest {
        private String paymentId;

        public PaymentRequest() {
        }

        public PaymentRequest(String paymentId) {
            this.paymentId = paymentId;
        }

        public String getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }
    }
}
