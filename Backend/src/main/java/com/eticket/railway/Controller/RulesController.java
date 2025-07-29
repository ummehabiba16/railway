package com.eticket.railway.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.RulesDTO;
import com.eticket.railway.Service.RulesService;

@RestController
@RequestMapping("/api/admin/rules")
@CrossOrigin(origins = "http://localhost:3000")
public class RulesController {

    @Autowired
    private RulesService rulesService;

    @GetMapping
    public ResponseEntity<?> getCurrentRules() {
        try {
            RulesDTO rules = rulesService.getCurrentRules();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rules", rules);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch rules: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/ticket-available-before")
    public ResponseEntity<?> updateTicketAvailableBefore(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateTicketAvailableBefore(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ticket Available Before updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/booking-hold-time")
    public ResponseEntity<?> updateBookingHoldTime(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateBookingHoldTime(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking Hold Time updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/child-fare-percentage")
    public ResponseEntity<?> updateChildFarePercentage(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateChildFarePercentage(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Child Fare Percentage updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/service-charge")
    public ResponseEntity<?> updateServiceCharge(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateServiceCharge(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Service Charge updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/bedding-charge")
    public ResponseEntity<?> updateBeddingCharge(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateBeddingCharge(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bedding Charge updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/monthly-booking-limit")
    public ResponseEntity<?> updateMonthlyBookingLimit(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateMonthlyBookingLimit(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Monthly Booking Limit updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/blocking-time")
    public ResponseEntity<?> updateBlockingTime(@RequestBody Map<String, Integer> request) {
        try {
            Integer value = request.get("value");
            rulesService.updateBlockingTime(value);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Blocking Time updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
