package com.eticket.railway.Controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.TicketDetailsDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.TicketService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
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

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody Map<String, Object> request) {
        try {
            String type = (String) request.get("type");
            String value = (String) request.get("value");
            Integer numberOfTickets = (Integer) request.get("numberOfTickets");
            
            // Call the verification service
            Map<String, Object> verificationResult = ticketService.verifyTicketLimit(type, value, numberOfTickets);
            
            return ResponseEntity.ok(verificationResult);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/release")
    public ResponseEntity<?> releaseTickets(@RequestParam String bookingId) {
        try {
            boolean success = ticketService.releaseTicketsByBookingId(bookingId);
            
            if (success) {
                return ResponseEntity.ok().build(); // 200 OK
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to release tickets");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/admin/tickets/release-all")
    public ResponseEntity<Map<String, Object>> releaseTicketsForAllTrains(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String dateStr = request.get("date");
            if (dateStr == null || dateStr.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Date is required");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDate travelDate = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            ticketService.releaseTicketsForAllTrains(travelDate);
            
            response.put("success", true);
            response.put("message", "Tickets released successfully for all trains on " + dateStr);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to release tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/admin/tickets/release-train")
    public ResponseEntity<Map<String, Object>> releaseTicketsForTrain(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String trainId = request.get("trainId");
            String dateStr = request.get("date");
            
            if (trainId == null || trainId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Train ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (dateStr == null || dateStr.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Date is required");
                return ResponseEntity.badRequest().body(response);
            }

            LocalDate travelDate = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            ticketService.releaseTicketsForTrain(trainId, travelDate);
            
            response.put("success", true);
            response.put("message", "Tickets released successfully for train " + trainId + " on " + dateStr);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to release tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/admin/trains/names")
    public ResponseEntity<Map<String, Object>> getAllTrainNames() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> trainNames = ticketService.getAllTrainNames();
            response.put("success", true);
            response.put("trains", trainNames);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch train names: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
