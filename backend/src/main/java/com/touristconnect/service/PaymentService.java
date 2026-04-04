package com.touristconnect.service;

import com.touristconnect.entity.*;
import com.touristconnect.repository.BookingRepository;
import com.touristconnect.repository.PaymentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;
    private final InvoiceService invoiceService;
    private final AdminDashboardService adminDashboardService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${khalti.secret.key}")
    private String khaltiSecretKey;

    @Value("${khalti.initiate.url}")
    private String initiateUrl;

    @Value("${khalti.lookup.url}")
    private String lookupUrl;

    @Value("${khalti.return.url}")
    private String returnUrl;

    @Value("${khalti.website.url}")
    private String websiteUrl;

    @Value("${app.commission.rate:0.10}")
    private Double commissionRate;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository,
            AuthService authService, InvoiceService invoiceService, AdminDashboardService adminDashboardService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
        this.invoiceService = invoiceService;
        this.adminDashboardService = adminDashboardService;
    }

    public static class InvoiceData {
        private final byte[] pdf;
        private final String invoiceNumber;

        public InvoiceData(byte[] pdf, String invoiceNumber) {
            this.pdf = pdf;
            this.invoiceNumber = invoiceNumber;
        }

        public byte[] getPdf() {
            return pdf;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }
    }

    public InvoiceData getInvoiceData(Long id) {
        // 1. Try to find by Payment ID first (with eager loading)
        // 2. If not found, try by Booking ID (to handle frontend mismatch gracefully)
        Payment payment = paymentRepository.findByIdWithBookingAndUsers(id)
                .or(() -> paymentRepository.findByBookingId(id)
                        .flatMap(p -> paymentRepository.findByIdWithBookingAndUsers(p.getId())))
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getBooking() == null) {
            logger.error("Payment {} found but associated booking is missing!", payment.getId());
            throw new RuntimeException("Invalid payment: booking missing");
        }

        // 3. Update authorization logic
        User currentUser = authService.getCurrentUser();

        boolean isTouristOwner = payment.getBooking().getTourist().getId().equals(currentUser.getId());
        boolean isGuideOwner = payment.getBooking().getGuide().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isTouristOwner && !isGuideOwner && !isAdmin) {
            throw new AccessDeniedException("Unauthorized invoice access");
        }

        // 4. Validate Status
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Invoice is only available for successful payments");
        }

        try {
            byte[] pdf = invoiceService.generateInvoicePdf(payment);
            return new InvoiceData(pdf, payment.getInvoiceNumber());
        } catch (Exception e) {
            logger.error("Failed to generate PDF for payment ID: {}", payment.getId(), e);
            throw e;
        }
    }

    @PostConstruct
    public void init() {
        System.out.println("=================================================");
        System.out.println("PAYMENT SERVICE BOOTUP DIAGNOSTIC");
        if (khaltiSecretKey == null || khaltiSecretKey.isEmpty() || khaltiSecretKey.contains("Placeholder")) {
            System.out.println("CRITICAL ERROR: Khalti Secret Key is MISSING or is still a PLACEHOLDER!");
            System.out.println("Current Key: " + khaltiSecretKey);
        } else {
            String masked = khaltiSecretKey.length() > 8
                    ? khaltiSecretKey.substring(0, 4) + "..." + khaltiSecretKey.substring(khaltiSecretKey.length() - 4)
                    : "****";
            System.out.println("Khalti Secret Key loaded successfully.");
            System.out.println("Key Format Check: "
                    + (khaltiSecretKey.startsWith("test_secret_key_") ? "CORRECT (TEST)" : "MANUAL VERIFY NEEDED"));
            System.out.println("Key Masked: " + masked);
        }
        System.out.println("Initiate URL: " + initiateUrl);
        System.out.println("=================================================");
    }

    public Map<String, Object> initiatePayment(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getTourist().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized booking access");
        }

        if (booking.getStatus() == BookingStatus.PAID) {
            throw new RuntimeException("Booking is already paid");
        }

        // Anti-duplicate protection: Check for successful payment
        paymentRepository.findByBookingId(bookingId).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.SUCCESS) {
                throw new RuntimeException("Payment already successful for this booking");
            }
        });

        // Idempotency: Return existing pending payment if available
        Payment existingPayment = paymentRepository.findByBookingId(bookingId).orElse(null);
        Payment payment = existingPayment != null ? existingPayment
                : new Payment(bookingId, userId, booking.getTotalPrice());

        if (payment.getKhaltiPidx() != null && payment.getStatus() == PaymentStatus.PENDING) {
            Map<String, Object> existingResponse = new HashMap<>();
            existingResponse.put("pidx", payment.getKhaltiPidx());
            existingResponse.put("payment_url", "https://test-pay.khalti.com/?pidx=" + payment.getKhaltiPidx()); // Simplified
                                                                                                                 // for
                                                                                                                 // sandbox
            return existingResponse;
        }

        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Call Khalti Initiate API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Verification of Secret Key (as requested by user for debugging)
        if (khaltiSecretKey == null || khaltiSecretKey.isEmpty() || khaltiSecretKey.contains("Placeholder")) {
            logger.error("CRITICAL: Khalti Secret Key is MISSING or is still a PLACEHOLDER in application.properties!");
        } else {
            String masked = khaltiSecretKey.length() > 8
                    ? khaltiSecretKey.substring(0, 4) + "..." + khaltiSecretKey.substring(khaltiSecretKey.length() - 4)
                    : "****";
            logger.info("Using Khalti Secret Key: (length: {}, masked: {})", khaltiSecretKey.length(), masked);
        }

        headers.set("Authorization", "Key " + khaltiSecretKey);

        Map<String, Object> body = new HashMap<>();
        body.put("return_url", returnUrl);
        body.put("website_url", websiteUrl);

        Double totalPrice = booking.getTotalPrice();
        if (totalPrice == null) {
            throw new RuntimeException("Booking total price is missing");
        }
        body.put("amount", (int) (totalPrice * 100)); // paisa
        body.put("purchase_order_id", bookingId.toString());
        body.put("purchase_order_name", "Tour Booking #" + bookingId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        System.out.println("--- KHALTI INITIATE REQUEST (TEMPORARY DEBUG) ---");
        System.out.println("URL: " + initiateUrl);
        System.out.println("Auth Header: " + headers.getFirst("Authorization"));
        System.out.println("Payload: " + body);
        System.out.println("-------------------------------------------------");

        logger.debug("--- KHALTI INITIATE REQUEST ---");
        logger.debug("URL: {}", initiateUrl);
        logger.debug("Auth Header: {}", headers.getFirst("Authorization"));
        logger.debug("Body: {}", body);
        logger.debug("-------------------------------");

        try {
            String url = java.util.Objects.requireNonNull(initiateUrl, "Khalti initiate URL is not configured");
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            logger.info("Khalti Response Status: {}", response.getStatusCode());
            logger.debug("Khalti Response Body: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody == null) {
                    logger.error("Empty response from Khalti for booking {}", bookingId);
                    throw new RuntimeException("Empty response from Khalti");
                }
                String pidx = (String) responseBody.get("pidx");
                logger.info("Successfully initiated Khalti payment. PIDX: {}", pidx);
                payment.setKhaltiPidx(pidx);
                paymentRepository.save(payment);
                return responseBody;
            } else {
                logger.error("Non-OK response from Khalti. Status: {}, Body: {}", response.getStatusCode(),
                        response.getBody());
                throw new RuntimeException("Khalti returned error: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            logger.error("401 UNAUTHORIZED from Khalti! Check your secret key and header format.");
            logger.error("Response Body: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Khalti Authentication Failed: 401 Unauthorized. Check your Secret Key.");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("HTTP Client Error from Khalti: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Khalti API Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("Unexpected error during Khalti initiation: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error initiating payment: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> verifyPayment(String pidx) {
        Payment payment = paymentRepository.findByKhaltiPidx(pidx)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return Map.of("status", "Completed", "message", "Payment already verified");
        }

        // Call Khalti Lookup API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Key " + khaltiSecretKey);

        Map<String, String> body = new HashMap<>();
        body.put("pidx", pidx);

        logger.debug("Verifying Khalti payment for PIDX: {}", pidx);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        try {
            String url = java.util.Objects.requireNonNull(lookupUrl, "Khalti lookup URL is not configured");
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody == null) {
                    logger.error("Empty response from Khalti verification for PIDX: {}", pidx);
                    throw new RuntimeException("Empty response from Khalti verification");
                }
                String status = (String) responseBody.get("status");
                logger.debug("Khalti verification status for {}: {}", pidx, status);

                if ("Completed".equalsIgnoreCase(status)) {
                    // Ensure no other SUCCESS payment exists for same booking (Race condition
                    // protection)
                    paymentRepository.findByBookingId(payment.getBookingId()).ifPresent(p -> {
                        if (p.getStatus() == PaymentStatus.SUCCESS && !p.getId().equals(payment.getId())) {
                            logger.warn("Duplicate successful payment detected for booking {}", payment.getBookingId());
                            throw new RuntimeException(
                                    "Another payment was already successfully processed for this booking");
                        }
                    });

                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setTransactionId((String) responseBody.get("transaction_id"));

                    // Extract Customer Info if available
                    Object customerInfoObj = responseBody.get("customer_info");
                    if (customerInfoObj instanceof Map) {
                        Map<?, ?> customerInfo = (Map<?, ?>) customerInfoObj;
                        payment.setCustomerEmail((String) customerInfo.get("email"));
                        payment.setCustomerPhone((String) customerInfo.get("phone"));
                    }

                    // Commission Calculation
                    Double totalAmount = payment.getAmount() != null ? payment.getAmount() : 0.0;
                    Double rate = commissionRate != null ? commissionRate : 0.10;
                    Double commission = totalAmount * rate;
                    payment.setCommissionAmount(commission != null ? commission : 0.0);
                    payment.setGuideAmount(totalAmount - (commission != null ? commission : 0.0));
                    payment.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

                    logger.info("Payment SUCCESS for booking {}. Transaction ID: {}, Commission: {}, Guide Payout: {}",
                            payment.getBookingId(), payment.getTransactionId(), commission, payment.getGuideAmount());


                    // Update Booking Status and link it to payment
                    Booking booking = bookingRepository.findById(payment.getBookingId())
                            .orElseThrow(() -> new RuntimeException("Booking not found"));
                    
                    payment.setBooking(booking); // Link the relationship explicitly
                    payment.setCreatedAt(java.time.LocalDateTime.now()); // Update to actual success time
                    paymentRepository.save(payment);

                    adminDashboardService.logActivity(
                            AdminActivityType.PAYMENT_SUCCESS,
                            "Payment of NPR " + payment.getAmount() + " successful for booking #" + payment.getBookingId(),
                            null,
                            payment.getId().toString());

                    booking.setStatus(BookingStatus.PAID);
                    bookingRepository.save(booking);
                } else if ("Expired".equalsIgnoreCase(status) || "User canceled".equalsIgnoreCase(status)) {
                    logger.warn("Payment FAILED/CANCELED for {}. Status: {}", pidx, status);
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }

                return responseBody;
            } else {
                logger.error("Failed to verify Khalti payment. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to verify payment with Khalti");
            }
        } catch (Exception e) {
            logger.error("Error during Khalti verification for {}: {}", pidx, e.getMessage());
            throw new RuntimeException("Error verifying payment: " + e.getMessage());
        }
    }
}
