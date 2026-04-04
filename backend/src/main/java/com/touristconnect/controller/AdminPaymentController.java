package com.touristconnect.controller;

import com.touristconnect.entity.Payment;
import com.touristconnect.entity.PaymentStatus;
import com.touristconnect.repository.PaymentRepository;
import com.touristconnect.service.AdminDashboardService;
import com.touristconnect.service.InvoiceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;
    private final InvoiceService invoiceService;
    private final AdminDashboardService adminDashboardService;

    public AdminPaymentController(PaymentRepository paymentRepository, InvoiceService invoiceService, AdminDashboardService adminDashboardService) {
        this.paymentRepository = paymentRepository;
        this.invoiceService = invoiceService;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        System.out.println("DEBUG: Fetching admin payments. Total in DB: " + paymentRepository.count());
        
        PaymentStatus paymentStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status and treat as no filter
            }
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> paymentPage = adminDashboardService.getFilteredPayments(paymentStatus, pageRequest);

        System.out.println("DEBUG: Returning " + paymentPage.getContent().size() + " payments for status: " + (status == null ? "ALL" : status));

        Map<String, Object> response = new HashMap<>();
        response.put("payments", paymentPage.getContent());
        response.put("currentPage", paymentPage.getNumber());
        response.put("totalItems", paymentPage.getTotalElements());
        response.put("totalPages", paymentPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        if (id == null) {
            throw new RuntimeException("Payment ID cannot be null");
        }
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Invoice only available for successful payments");
        }

        byte[] pdf = invoiceService.generateInvoicePdf(payment);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("Invoice-" + payment.getInvoiceNumber() + ".pdf")
                .build());

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
