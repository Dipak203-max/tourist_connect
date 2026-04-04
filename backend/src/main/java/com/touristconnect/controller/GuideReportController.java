package com.touristconnect.controller;

import com.touristconnect.service.GuideReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide/reports")
@PreAuthorize("hasRole('GUIDE')")
@RequiredArgsConstructor
public class GuideReportController {

    private final GuideReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<?> daily(
            @RequestParam String date,
            Authentication auth) {
        return ResponseEntity.ok(reportService.getDailyReport(auth.getName(), date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> monthly(
            @RequestParam int year,
            @RequestParam int month,
            Authentication auth) {
        return ResponseEntity.ok(reportService.getMonthlyReport(auth.getName(), year, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> yearly(
            @RequestParam int year,
            Authentication auth) {
        return ResponseEntity.ok(reportService.getYearlyReport(auth.getName(), year));
    }

    @GetMapping("/download")
    public ResponseEntity<?> download(
            @RequestParam String type,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            Authentication auth) {

        byte[] pdf = reportService.generateGuideReportPdf(auth.getName(), type, year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=guide-report.pdf")
                .contentType(MediaType.parseMediaType("application/pdf"))
                .body(pdf);
    }
}
