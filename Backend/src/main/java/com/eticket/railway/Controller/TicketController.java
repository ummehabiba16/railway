package com.eticket.railway.Controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.TicketDetailsDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.TicketService;

@RestController
@RequestMapping("/api")
public class TicketController {

    private final TicketService ticketService;
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/ticket")
    public ResponseEntity<?> getFullDetails(@RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId"); // Extract trainId from the request body
            List<TicketDetailsDTO> ticket = ticketService.getTicketDetails(paymentId);
            if (ticket.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No ticket found for the given payment ID");
            }
            return ResponseEntity.ok(ticket);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
    @PostMapping("/ticket/booking")
    public ResponseEntity<?> getTicketDetailsByBookingId(@RequestBody Map<String, String> request) {
        try {
            String bookingId = request.get("bookingId"); // Extract bookingId from the request body
            List<TicketDetailsDTO> ticket = ticketService.getTicketDetailsByBookingId(bookingId);
            if (ticket.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No ticket found for the given booking ID");
            }
            return ResponseEntity.ok(ticket);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}
