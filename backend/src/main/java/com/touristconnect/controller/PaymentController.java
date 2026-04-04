package com.touristconnect.controller;

import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.service.PaymentService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/initiate/{bookingId}")
    public ResponseEntity<Map<String, Object>> initiatePayment(@PathVariable Long bookingId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(paymentService.initiatePayment(bookingId, user.getId()));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> request) {
        String pidx = request.get("pidx");
        logger.debug("Received verification request for PIDX: {}", pidx);
        return ResponseEntity.ok(paymentService.verifyPayment(pidx));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        PaymentService.InvoiceData invoiceData = paymentService.getInvoiceData(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("invoice.pdf")
                .build());

        return new ResponseEntity<>(invoiceData.getPdf(), headers, HttpStatus.OK);
    }
}
