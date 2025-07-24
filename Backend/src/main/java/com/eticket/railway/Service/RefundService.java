package com.eticket.railway.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.eticket.railway.DTO.RefundRequest;
import com.eticket.railway.DTO.RefundResponse;
import com.eticket.railway.DTO.RefundStatusResponse;
import com.eticket.railway.Entity.Refund;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.RefundRepository;

@Service
public class RefundService {

    @Autowired
    private RefundRepository refundRepository;

    @Value("${sslcommerz.store_id}")
    private String storeId;

    @Value("${sslcommerz.store_passwd}")
    private String storePassword;

    @Value("${sslcommerz.is_live}")
    private boolean isLive;

    private final String sandboxRefundURL = "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";
    private final String liveRefundURL = "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

    public RefundResponse initiateRefund(RefundRequest refundRequest) {
        try {
            // Get bank transaction ID and payment ID from booking ID
            String bankTranId = refundRepository.getBankTranIdByBookingId(refundRequest.getBookingId());
            String paymentId = refundRepository.getPaymentIdByBookingId(refundRequest.getBookingId());

            if (bankTranId == null || paymentId == null) {
                throw new NoDataFoundException("No payment found for booking ID: " + refundRequest.getBookingId());
            }

            // Check if refund already exists
            Refund existingRefund = refundRepository.findByPaymentIdAndBookingId(paymentId, refundRequest.getBookingId());
            if (existingRefund != null) {
                throw new RuntimeException("Refund already requested for this booking");
            }

            // Calculate refund amount based on policy
            int refundAmount = calculateRefundAmount(refundRequest.getBookingId());
            
            if (refundAmount <= 0) {
                throw new RuntimeException("No refund available for this booking (less than 6 hours before departure)");
            }

            // Generate unique refund transaction ID
            String refundTransId = "REFUND" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);

            System.out.println("Initiating refund with transaction ID: " + refundTransId);
            System.out.println("Bank Transaction ID: " + bankTranId);
            System.out.println("Booking ID: " + refundRequest.getBookingId());
            System.out.println("Calculated Refund Amount: " + refundAmount);

            // Save refund request to database first
            Refund refund = new Refund();
            refund.setPaymentId(paymentId);
            refund.setBookingId(refundRequest.getBookingId());
            refund.setRefundAmount(refundAmount);
            refund.setRefundStatus("Requested");
            refund.setRefundTransId(refundTransId);
            refund.setBankTranId(bankTranId);
            refundRepository.save(refund);

            // Call SSLCommerz refund API
            String url = isLive ? liveRefundURL : sandboxRefundURL;
            
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
                    .queryParam("bank_tran_id", bankTranId)
                    .queryParam("refund_trans_id", refundTransId)
                    .queryParam("store_id", storeId)
                    .queryParam("store_passwd", storePassword)
                    .queryParam("refund_amount", refundAmount)
                    .queryParam("refund_remarks", refundRequest.getRefundRemarks())
                    .queryParam("format", "json");

            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(builder.toUriString(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

            if (responseBody != null) {
                RefundResponse refundResponse = new RefundResponse();
                refundResponse.setApiConnect((String) responseBody.get("APIConnect"));
                refundResponse.setBankTranId((String) responseBody.get("bank_tran_id"));
                refundResponse.setTransId((String) responseBody.get("trans_id"));
                refundResponse.setRefundRefId((String) responseBody.get("refund_ref_id"));
                refundResponse.setStatus((String) responseBody.get("status"));
                refundResponse.setErrorReason((String) responseBody.get("errorReason"));
                refundResponse.setRefundAmount(refundAmount);
                refundResponse.setBookingId(refundRequest.getBookingId());
                refundResponse.setPaymentId(paymentId);

                // Update refund status based on response
                if ("success".equalsIgnoreCase(refundResponse.getStatus())) {
                    refundRepository.updateRefundStatus(paymentId, refundRequest.getBookingId(), "Processing", refundResponse.getRefundRefId());
                    // Update booking status to RefundPgr
                    refundRepository.updateBookingStatus(refundRequest.getBookingId(), "RefundPgr");
                } else {
                    refundRepository.updateRefundStatus(paymentId, refundRequest.getBookingId(), "Failed", null);
                }

                return refundResponse;
            }

            throw new RuntimeException("No response from SSLCommerz refund API");

        } catch (Exception e) {
            System.err.println("Error initiating refund: " + e.getMessage());
            throw new RuntimeException("Refund initiation failed: " + e.getMessage());
        }
    }

    private int calculateRefundAmount(String bookingId) {
        try {
            // Get total amount
            int totalAmount = refundRepository.getTotalAmountByBookingId(bookingId);
            
            // Get travel date and departure time
            String travelDateStr = refundRepository.getTravelDateByBookingId(bookingId);
            String departureTimeStr = refundRepository.getDepartureTimeByBookingId(bookingId);
            
            // Parse travel date and departure time
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");
            SimpleDateFormat fullFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
            
            Date travelDate = dateFormat.parse(travelDateStr);
            Date departureTime = timeFormat.parse(departureTimeStr);
            
            // Combine date and time
            String fullDateTimeStr = travelDateStr + " " + departureTimeStr;
            Date departureDateTime = fullFormat.parse(fullDateTimeStr);
            
            // Calculate hours until departure
            Date now = new Date();
            long timeDiffMs = departureDateTime.getTime() - now.getTime();
            long hoursUntilDeparture = timeDiffMs / (1000 * 60 * 60);
            
            System.out.println("Hours until departure: " + hoursUntilDeparture);
            System.out.println("Total amount: " + totalAmount);
            
            // Apply refund policy
            int deductionAmount;
            double deductionPercentage;
            
            if (hoursUntilDeparture < 6) {
                // No refund for less than 6 hours
                return 0;
            } else if (hoursUntilDeparture < 12) {
                // Less than 12 hours and more than 6 hours: BDT 40 or 75% of ticket fare, whichever is more
                deductionPercentage = 0.75;
                deductionAmount = Math.max(40, (int) (totalAmount * deductionPercentage));
            } else if (hoursUntilDeparture < 24) {
                // Less than 24 hours and more than 12 hours: BDT 40 or 50% of ticket fare, whichever is more
                deductionPercentage = 0.50;
                deductionAmount = Math.max(40, (int) (totalAmount * deductionPercentage));
            } else if (hoursUntilDeparture < 48) {
                // Less than 48 hours and more than 24 hours: BDT 40 or 25% of ticket fare, whichever is more
                deductionPercentage = 0.25;
                deductionAmount = Math.max(40, (int) (totalAmount * deductionPercentage));
            } else {
                // 48 hours or more prior: BDT 40 or 10% of ticket fare, whichever is more
                deductionPercentage = 0.10;
                deductionAmount = Math.max(40, (int) (totalAmount * deductionPercentage));
            }
            
            int refundAmount = totalAmount - deductionAmount;
            
            System.out.println("Deduction amount: " + deductionAmount);
            System.out.println("Refund amount: " + refundAmount);
            
            return Math.max(0, refundAmount); // Ensure non-negative refund
            
        } catch (ParseException e) {
            throw new RuntimeException("Error parsing date/time for booking: " + bookingId, e);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating refund amount for booking: " + bookingId, e);
        }
    }

    public RefundStatusResponse queryRefundStatus(String refundRefId) {
        try {
            String url = isLive ? liveRefundURL : sandboxRefundURL;
            
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
                    .queryParam("refund_ref_id", refundRefId)
                    .queryParam("store_id", storeId)
                    .queryParam("store_passwd", storePassword)
                    .queryParam("format", "json");

            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(builder.toUriString(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

            if (responseBody != null) {
                RefundStatusResponse statusResponse = new RefundStatusResponse();
                statusResponse.setApiConnect((String) responseBody.get("APIConnect"));
                statusResponse.setBankTranId((String) responseBody.get("bank_tran_id"));
                statusResponse.setTranId((String) responseBody.get("tran_id"));
                statusResponse.setRefundRefId((String) responseBody.get("refund_ref_id"));
                statusResponse.setStatus((String) responseBody.get("status"));
                statusResponse.setErrorReason((String) responseBody.get("errorReason"));

                // Update local refund status based on API response
                Refund localRefund = refundRepository.findByRefundRefId(refundRefId);
                if (localRefund != null) {
                    String newStatus = "Processing"; // Default
                    if ("refunded".equalsIgnoreCase(statusResponse.getStatus())) {
                        newStatus = "Completed";
                        // Update booking status to Refunded
                        refundRepository.updateBookingStatus(localRefund.getBookingId(), "Refunded");
                    } else if ("cancelled".equalsIgnoreCase(statusResponse.getStatus())) {
                        newStatus = "Cancelled";
                    }
                    refundRepository.updateRefundStatus(localRefund.getPaymentId(), localRefund.getBookingId(), newStatus, refundRefId);
                }

                return statusResponse;
            }

            throw new RuntimeException("No response from SSLCommerz refund status API");

        } catch (Exception e) {
            System.err.println("Error querying refund status: " + e.getMessage());
            throw new RuntimeException("Refund status query failed: " + e.getMessage());
        }
    }

    public Refund getRefundByBookingId(String bookingId) {
        try {
            String paymentId = refundRepository.getPaymentIdByBookingId(bookingId);
            if (paymentId == null) {
                throw new NoDataFoundException("No payment found for booking ID: " + bookingId);
            }
            
            Refund refund = refundRepository.findByPaymentIdAndBookingId(paymentId, bookingId);
            if (refund == null) {
                throw new NoDataFoundException("No refund found for booking ID: " + bookingId);
            }
            
            return refund;
        } catch (Exception e) {
            throw new RuntimeException("Error getting refund for booking: " + bookingId, e);
        }
    }

    public boolean isRefundEligible(String bookingId) {
        try {
            return calculateRefundAmount(bookingId) > 0;
        } catch (Exception e) {
            return false;
        }
    }

    public int calculateEstimatedRefund(String bookingId) {
        try {
            return calculateRefundAmount(bookingId);
        } catch (Exception e) {
            return 0;
        }
    }
}
