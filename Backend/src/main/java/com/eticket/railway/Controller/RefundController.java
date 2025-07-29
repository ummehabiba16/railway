package com.eticket.railway.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.RefundRequest;
import com.eticket.railway.DTO.RefundResponse;
import com.eticket.railway.DTO.RefundStatusResponse;
import com.eticket.railway.Entity.Refund;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.RefundService;

@RestController
@RequestMapping("/api/refund")
@CrossOrigin(origins = {"http://localhost:3000", "https://your-frontend-domain.com"})
public class RefundController {

    @Autowired
    private RefundService refundService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateRefund(@RequestBody RefundRequest refundRequest) {
        System.out.println("=== REFUND INITIATION REQUEST ===");
        System.out.println("Booking ID: " + refundRequest.getBookingId());
        System.out.println("Refund Remarks: " + refundRequest.getRefundRemarks());

        try {
            RefundResponse refundResponse = refundService.initiateRefund(refundRequest);
            
            if ("DONE".equals(refundResponse.getApiConnect())) {
                if ("success".equalsIgnoreCase(refundResponse.getStatus())) {
                    System.out.println("Refund initiated successfully: " + refundResponse.getRefundRefId());
                    return ResponseEntity.ok(refundResponse);
                } else {
                    System.err.println("Refund initiation failed: " + refundResponse.getErrorReason());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(refundResponse);
                }
            } else {
                System.err.println("API connection failed: " + refundResponse.getApiConnect());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(refundResponse);
            }

        } catch (NoDataFoundException e) {
            System.err.println("Booking not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found: " + e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Refund initiation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refund initiation failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during refund initiation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }


    @PostMapping("/initiate/stationMaster")
    public ResponseEntity<?> initiateRefundByStationMaster(@RequestBody RefundRequest refundRequest) {
        System.out.println("=== STATION MASTER REFUND INITIATION REQUEST ===");
        System.out.println("Booking ID: " + refundRequest.getBookingId());
        System.out.println("Refund Remarks: " + refundRequest.getRefundRemarks());
        
        try {
            // Call service to handle station master refund logic
            RefundResponse refundResponse = refundService.initiateRefundByStationMaster(refundRequest);
            
            System.out.println("Station Master refund initiated successfully for booking: " + refundRequest.getBookingId());
            return ResponseEntity.ok(refundResponse);

        } catch (NoDataFoundException e) {
            System.err.println("Booking not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found: " + e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Refund initiation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refund initiation failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during refund initiation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getRefundStatus(@RequestParam String refundRefId) {
        System.out.println("=== REFUND STATUS QUERY ===");
        System.out.println("Refund Reference ID: " + refundRefId);

        try {
            RefundStatusResponse statusResponse = refundService.queryRefundStatus(refundRefId);
            
            if ("DONE".equals(statusResponse.getApiConnect())) {
                System.out.println("Refund status retrieved: " + statusResponse.getStatus());
                return ResponseEntity.ok(statusResponse);
            } else {
                System.err.println("API connection failed: " + statusResponse.getApiConnect());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(statusResponse);
            }

        } catch (RuntimeException e) {
            System.err.println("Refund status query error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refund status query failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during refund status query: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    @GetMapping("/booking")
    public ResponseEntity<?> getRefundByBookingId(@RequestParam String bookingId) {
        System.out.println("=== GET REFUND BY BOOKING ID ===");
        System.out.println("Booking ID: " + bookingId);

        try {
            Refund refund = refundService.getRefundByBookingId(bookingId);
            System.out.println("Refund found for booking: " + bookingId + ", Status: " + refund.getRefundStatus());
            return ResponseEntity.ok(refund);

        } catch (NoDataFoundException e) {
            System.err.println("Refund not found for booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Refund not found for booking: " + bookingId);
        } catch (RuntimeException e) {
            System.err.println("Error getting refund for booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error getting refund: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error getting refund for booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    @GetMapping("/eligibility")
    public ResponseEntity<?> checkRefundEligibility(@RequestParam String bookingId) {
        System.out.println("=== CHECK REFUND ELIGIBILITY ===");
        System.out.println("Booking ID: " + bookingId);

        try {
            boolean isEligible = refundService.isRefundEligible(bookingId);
            
            if (isEligible) {
                int estimatedRefund = refundService.calculateEstimatedRefund(bookingId);
                return ResponseEntity.ok(Map.of(
                    "eligible", true,
                    "estimatedRefund", estimatedRefund,
                    "message", "Booking is eligible for refund"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "estimatedRefund", 0,
                    "message", "Booking is not eligible for refund (less than 6 hours before departure)"
                ));
            }

        } catch (NoDataFoundException e) {
            System.err.println("Booking not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error checking refund eligibility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error checking refund eligibility: " + e.getMessage());
        }
    }

    @GetMapping("/calculate")
    public ResponseEntity<?> calculateRefundAmount(@RequestParam String bookingId) {
        System.out.println("=== CALCULATE REFUND AMOUNT ===");
        System.out.println("Booking ID: " + bookingId);

        try {
            // Check if refund is eligible first
            boolean isEligible = refundService.isRefundEligible(bookingId);
            
            if (!isEligible) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Booking is not eligible for refund",
                    "message", "Booking is not eligible for refund (less than 6 hours before departure)",
                    "refundAmount", 0
                ));
            }

            // Calculate the actual refund amount
            int refundAmount = refundService.calculateEstimatedRefund(bookingId);
            
            System.out.println("Calculated refund amount: " + refundAmount + " for booking: " + bookingId);
            
            return ResponseEntity.ok(Map.of(
                "refundAmount", refundAmount,
                "bookingId", bookingId,
                "message", "Refund amount calculated successfully"
            ));

        } catch (NoDataFoundException e) {
            System.err.println("Booking not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Booking not found",
                "message", e.getMessage(),
                "refundAmount", 0
            ));
        } catch (Exception e) {
            System.err.println("Error calculating refund amount: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Error calculating refund amount",
                "message", e.getMessage(),
                "refundAmount", 0
            ));
        }
    }

    @PostMapping("/admin/process")
    public ResponseEntity<Map<String, Object>> processAdminRefund(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== ADMIN REFUND INITIATION REQUEST ===");
        
        try {
            String trainId = request.get("trainId");
            String travelDate = request.get("travelDate");
            String coachId = request.get("coachId");
            
            System.out.println("Train ID: " + trainId);
            System.out.println("Travel Date: " + travelDate);
            System.out.println("Coach ID: " + coachId);
            
            if (trainId == null || trainId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Train ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (travelDate == null || travelDate.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Travel date is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (coachId == null || coachId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Coach selection is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Process refunds for all bookings matching the criteria
            List<com.eticket.railway.DTO.RefundResponse> refundResponses = refundService.processAdminRefunds(trainId, travelDate, coachId);
            
            // Count successful and failed refunds
            long successCount = refundResponses.stream()
                .filter(refund -> "success".equalsIgnoreCase(refund.getStatus()))
                .count();
            long failCount = refundResponses.size() - successCount;
            
            System.out.println("Refund processing completed - Success: " + successCount + ", Failed: " + failCount);
            
            String message;
            if (successCount == refundResponses.size() && successCount > 0) {
                message = "Cancellation and refund process completed successfully for train " + trainId + 
                         " on " + travelDate + " (Coach: " + coachId + "). " +
                         "All " + successCount + " refunds processed successfully and ticket status updated to CANCELLED.";
            } else if (successCount > 0) {
                message = "Cancellation and refund process partially completed for train " + trainId + 
                         " on " + travelDate + " (Coach: " + coachId + "). " +
                         "Successful refunds: " + successCount + ", Failed: " + failCount + 
                         ". Ticket status not updated due to failed refunds.";
            } else {
                message = "Cancellation and refund process failed for train " + trainId + 
                         " on " + travelDate + " (Coach: " + coachId + "). " +
                         "No successful refunds processed.";
            }
            
            response.put("success", successCount > 0);
            response.put("message", message);
            response.put("totalProcessed", refundResponses.size());
            response.put("successfulRefunds", successCount);
            response.put("failedRefunds", failCount);
            response.put("allRefundsSuccessful", successCount == refundResponses.size() && successCount > 0);
            response.put("ticketsCancelled", successCount == refundResponses.size() && successCount > 0);
            response.put("refundDetails", refundResponses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in admin refund processing: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to process refund: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
