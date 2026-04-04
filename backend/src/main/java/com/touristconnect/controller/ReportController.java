package com.touristconnect.controller;

import com.touristconnect.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyReport(@RequestParam String date) {
        return ResponseEntity.ok(reportService.getDailyReport(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyReport(@RequestParam int year) {
        return ResponseEntity.ok(reportService.getYearlyReport(year));
    }

    @GetMapping("/download")
    public ResponseEntity<?> downloadReport(
            @RequestParam String type,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {

        byte[] pdf = reportService.generateReportPdf(type, year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf")
                .contentType(MediaType.parseMediaType("application/pdf"))
                .body(pdf);
    }
}
