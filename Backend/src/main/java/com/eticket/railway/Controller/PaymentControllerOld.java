// package com.eticket.railway.Controller;

// import java.util.Map;
// import java.util.UUID;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.HttpEntity;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.util.LinkedMultiValueMap;
// import org.springframework.util.MultiValueMap;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.client.RestTemplate;

// import com.eticket.railway.DTO.PaymentRequest;
// import com.eticket.railway.Entity.Payment;
// import com.eticket.railway.Repository.PaymentRepository;

// @RestController
// @RequestMapping("/api/payment")
// @CrossOrigin(origins = {"http://localhost:3000", "https://your-frontend-domain.com"})
// public class PaymentController {

//     @Value("${sslcommerz.store_id}")
//     private String storeId;

//     @Value("${sslcommerz.store_passwd}")
//     private String storePassword;

//     @Value("${sslcommerz.is_live}")
//     private boolean isLive;

//     private final String sandboxURL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
//     private final String liveURL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

//     @Value("${frontend.base-url}")
//     private String frontendBaseURL;

//     @Value("${backend.base-url}")
//     private String backendBaseURL;

//     @Autowired
//     private PaymentRepository paymentRepository;

//     @PostMapping("/initiate")
//     public ResponseEntity<Map<String, String>> initiatePayment(@RequestBody PaymentRequest paymentRequest) {
//         RestTemplate restTemplate = new RestTemplate();
//         String url = isLive ? liveURL : sandboxURL;
        
//         // Generate unique transaction ID
//         String transactionId = "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
        
//         System.out.println("Initiating payment with transaction ID: " + transactionId);
//         System.out.println("Backend Base URL: " + backendBaseURL);
//         System.out.println("Frontend Base URL: " + frontendBaseURL);
        
//         // Prepare request body
//         MultiValueMap<String, String> body = new LinkedMultiValueMap<>();

//         body.add("store_id", storeId);
//         body.add("store_passwd", storePassword);
//         body.add("total_amount", String.valueOf(paymentRequest.getAmount()));
//         body.add("currency", paymentRequest.getCurrency());
//         body.add("tran_id", transactionId);
        
//         // URLs - Use frontend URLs since SSLCommerz base URL is set to localhost:3000
//         body.add("success_url", frontendBaseURL + "/payment/success");
//         body.add("fail_url", frontendBaseURL + "/payment/failed");
//         body.add("cancel_url", frontendBaseURL + "/payment/cancelled");
//         body.add("ipn_url", backendBaseURL + "/api/payment/ipn"); // Keep IPN as backend

//         // Product information
//         body.add("product_name", "Train Ticket");
//         body.add("product_category", "Transportation");
//         body.add("product_profile", "general");
        
//         // Shipping information
//         body.add("shipping_method", "NO");
//         body.add("num_of_item", "1");
        
//         // Customer info
//         body.add("cus_name", paymentRequest.getUserId());
//         body.add("cus_email", paymentRequest.getUserId() + "@example.com");
//         body.add("cus_add1", "Dhaka");
//         body.add("cus_city", "Dhaka");
//         body.add("cus_postcode", "1000");
//         body.add("cus_country", "Bangladesh");
//         body.add("cus_phone", "01711111111");
        
//         // Custom fields - Make sure these values are not null or empty
//         String invoiceId = paymentRequest.getInvoiceId();
//         String userId = paymentRequest.getUserId();
        
//         if (invoiceId == null || invoiceId.isEmpty()) {
//             invoiceId = "INV_" + System.currentTimeMillis();
//         }
//         if (userId == null || userId.isEmpty()) {
//             userId = "USER_" + System.currentTimeMillis();
//         }
        
//         body.add("value_a", invoiceId);
//         body.add("value_b", userId);
//         body.add("value_c", transactionId);
//         body.add("value_d", ""); // Optional fourth value
        
//         System.out.println("Custom values - Invoice: " + invoiceId + ", User: " + userId + ", Transaction: " + transactionId);
        
//         HttpHeaders headers = new HttpHeaders();
//         headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//         HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

//         try {
//             ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
//             Map<String, Object> responseBody = response.getBody();

//             if (responseBody != null && "FAILED".equals(responseBody.get("status"))) {
//                 throw new RuntimeException("SSLCommerz Payment Failed: " + responseBody.get("failedreason"));
//             }

//             return ResponseEntity.ok(Map.of("GatewayPageURL", (String) responseBody.get("GatewayPageURL")));

//         } catch (Exception e) {
//             System.err.println("Error initiating payment: " + e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
//         }
//     }

//     @PostMapping("/success")
//     public ResponseEntity<String> handleSuccess(@RequestParam Map<String, String> params) {
//         System.out.println("=== PAYMENT SUCCESS CALLBACK RECEIVED ===");
//         System.out.println("Payment success callback received with params: " + params);
        
//         // Log all parameters for debugging
//         params.forEach((key, value) -> {
//             System.out.println(key + " = " + value);
//         });
        
//         try {
//             String paymentId = params.get("tran_id");
//             String trxId = params.get("bank_tran_id");
//             String status = params.get("status");
//             String invoiceId = params.get("value_a");
//             String userId = params.get("value_b");
//             String amount = params.get("amount");

//             System.out.println("Processing payment - ID: " + paymentId + ", Status: " + status + ", Invoice: " + invoiceId);

//             if (paymentId == null || status == null || invoiceId == null) {
//                 System.err.println("Missing required parameters in payment callback");
//                 return ResponseEntity.ok()
//                     .contentType(MediaType.TEXT_HTML)
//                     .body(generateRedirectHTML(frontendBaseURL + "/payment/failed?invoice=" + invoiceId + "&error=missing_params"));
//             }

//             if ("VALID".equalsIgnoreCase(status) || "VALIDATED".equalsIgnoreCase(status)) {
//                 // Save payment record
//                 Payment payment = new Payment();
//                 payment.setPaymentId(paymentId);
//                 payment.setTrxId(trxId);
//                 payment.setPaymentMode("SSL");
//                 payment.setStatus("SUCCESSFUL");
//                 payment.setInvoiceId(invoiceId);
//                 paymentRepository.save(payment);
//                 System.out.println("Payment saved successfully: " + paymentId);

//                 // Redirect to frontend success page
//                 return ResponseEntity.ok()
//                     .contentType(MediaType.TEXT_HTML)
//                     .body(generateRedirectHTML(frontendBaseURL + "/payment/success?invoice=" + invoiceId));
//             }

//             // Payment failed or invalid status
//             System.err.println("Payment failed or invalid status: " + status);
//             return ResponseEntity.ok()
//                 .contentType(MediaType.TEXT_HTML)
//                 .body(generateRedirectHTML(frontendBaseURL + "/payment/failed?invoice=" + invoiceId + "&status=" + status));

//         } catch (Exception e) {
//             System.err.println("Error processing payment success: " + e.getMessage());
//             e.printStackTrace();
//             return ResponseEntity.ok()
//                 .contentType(MediaType.TEXT_HTML)
//                 .body(generateRedirectHTML(frontendBaseURL + "/payment/failed?error=processing_error"));
//         }
//     }

//     @PostMapping("/fail")
//     public ResponseEntity<String> handleFail(@RequestParam Map<String, String> params) {
//         System.out.println("=== PAYMENT FAIL CALLBACK RECEIVED ===");
//         System.out.println("Payment fail callback received with params: " + params);
        
//         String invoiceId = params.get("value_a");
//         String failReason = params.get("failedreason");
        
//         return ResponseEntity.ok()
//             .contentType(MediaType.TEXT_HTML)
//             .body(generateRedirectHTML(frontendBaseURL + "/payment/failed?invoice=" + invoiceId + "&reason=" + failReason));
//     }

//     @PostMapping("/cancel")
//     public ResponseEntity<String> handleCancel(@RequestParam Map<String, String> params) {
//         System.out.println("=== PAYMENT CANCEL CALLBACK RECEIVED ===");
//         System.out.println("Payment cancel callback received with params: " + params);
        
//         String invoiceId = params.get("value_a");
        
//         return ResponseEntity.ok()
//             .contentType(MediaType.TEXT_HTML)
//             .body(generateRedirectHTML(frontendBaseURL + "/payment/cancelled?invoice=" + invoiceId));
//     }

//     @PostMapping("/ipn")
//     public ResponseEntity<String> handleIPN(@RequestParam Map<String, String> params) {
//         System.out.println("=== PAYMENT IPN RECEIVED ===");
//         System.out.println("Payment IPN received with params: " + params);
        
//         // Process IPN for additional verification
//         return ResponseEntity.ok("IPN processed");
//     }

//     @PostMapping("/verify")
//     public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> params) {
//         System.out.println("=== PAYMENT VERIFICATION REQUEST ===");
//         System.out.println("Payment verification received with params: " + params);
        
//         try {
//             String paymentId = params.get("tran_id");
//             String trxId = params.get("bank_tran_id");
//             String status = params.get("status");
//             String invoiceId = params.get("value_a");
//             String userId = params.get("value_b");
//             String amount = params.get("amount");

//             System.out.println("Verifying payment - ID: " + paymentId + ", Status: " + status + ", Invoice: " + invoiceId);

//             if (paymentId == null || status == null || invoiceId == null) {
//                 System.err.println("Missing required parameters in payment verification");
//                 return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Missing required parameters"));
//             }

//             if ("VALID".equalsIgnoreCase(status) || "VALIDATED".equalsIgnoreCase(status)) {
//                 // Check if payment already exists to prevent duplicate entries
//                 // if (paymentRepository.existsByPaymentId(paymentId)) {
//                 //     System.out.println("Payment already exists: " + paymentId);
//                 //     return ResponseEntity.ok(Map.of("success", true, "message", "Payment already processed"));
//                 // }

//                 // Save payment record
//                 Payment payment = new Payment();
//                 payment.setPaymentId(paymentId);
//                 payment.setTrxId(trxId);
//                 payment.setPaymentMode("SSL");
//                 payment.setStatus("SUCCESSFUL");
//                 payment.setInvoiceId(invoiceId);
//                 paymentRepository.save(payment);
//                 System.out.println("Payment saved successfully: " + paymentId);

//                 return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified and saved successfully"));
//             }

//             // Payment failed or invalid status
//             System.err.println("Payment verification failed - invalid status: " + status);
//             return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid payment status: " + status));

//         } catch (Exception e) {
//             System.err.println("Error verifying payment: " + e.getMessage());
//             e.printStackTrace();
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("success", false, "error", "Payment verification failed: " + e.getMessage()));
//         }
//     }

//     private String generateRedirectHTML(String redirectUrl) {
//         return "<!DOCTYPE html>" +
//                "<html>" +
//                "<head>" +
//                "<meta charset='UTF-8'>" +
//                "<meta http-equiv='refresh' content='0; url=" + redirectUrl + "'>" +
//                "<title>Payment Processing</title>" +
//                "<style>" +
//                "body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #f5f5f5; }" +
//                ".container { max-width: 400px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
//                ".loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }" +
//                "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }" +
//                ".redirect-link { color: #3498db; text-decoration: none; font-weight: bold; }" +
//                "</style>" +
//                "</head>" +
//                "<body>" +
//                "<div class='container'>" +
//                "<h3>Payment Processed Successfully!</h3>" +
//                "<div class='loader'></div>" +
//                "<p>Please wait while we redirect you...</p>" +
//                "<p>If you are not redirected automatically, <a href='" + redirectUrl + "' class='redirect-link'>click here</a>.</p>" +
//                "</div>" +
//                "<script>" +
//                "console.log('Redirecting to: " + redirectUrl + "');" +
//                "setTimeout(function() { " +
//                "  try { " +
//                "    console.log('Attempting redirect...');" +
//                "    window.location.replace('" + redirectUrl + "'); " +
//                "  } catch(e) { " +
//                "    console.error('Redirect failed:', e);" +
//                "    window.location.href = '" + redirectUrl + "'; " +
//                "  } " +
//                "}, 1000);" +
//                "</script>" +
//                "</body>" +
//                "</html>";
//     }
// }