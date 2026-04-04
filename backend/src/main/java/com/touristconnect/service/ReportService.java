package com.touristconnect.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.touristconnect.dto.ReportDTO;
import com.touristconnect.entity.PaymentStatus;
import com.touristconnect.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public ReportDTO.DailyReportDTO getDailyReport(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return new ReportDTO.DailyReportDTO(
                getSummary(date, date),
                getInvoices(date, date));
    }

    public ReportDTO.MonthlyReportDTO getMonthlyReport(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        return new ReportDTO.MonthlyReportDTO(
                getSummary(firstDay, lastDay),
                getInvoices(firstDay, lastDay));
    }

    public ReportDTO.YearlyReportDTO getYearlyReport(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return new ReportDTO.YearlyReportDTO(
                getSummary(start, end),
                getInvoices(start, end));
    }

    public ReportDTO.DailyReportDTO getRangeReport(LocalDate start, LocalDate end) {
        return new ReportDTO.DailyReportDTO(
                getSummary(start, end),
                getInvoices(start, end));
    }

    public byte[] generateReportPdf(String type, int year, Integer month) {
        ReportDTO.FinancialSummaryDTO summary;
        List<ReportDTO.InvoiceSummaryDTO> invoices;
        String title;

        if ("monthly".equalsIgnoreCase(type)) {
            ReportDTO.MonthlyReportDTO monthly = getMonthlyReport(year, month);
            summary = monthly.getSummary();
            invoices = monthly.getInvoices();
            title = "Monthly Report - " + year + "-" + String.format("%02d", month);
        } else if ("yearly".equalsIgnoreCase(type)) {
            ReportDTO.YearlyReportDTO yearly = getYearlyReport(year);
            summary = yearly.getSummary();
            invoices = yearly.getInvoices();
            title = "Yearly Report - " + year;
        } else {
            // Default or handle Daily/Range if needed, but user's code for Controller
            // only passes year/month for now.
            // I'll add a safe fallback.
            summary = new ReportDTO.FinancialSummaryDTO(0L, 0.0, 0.0, 0.0);
            invoices = java.util.Collections.emptyList();
            title = "Report";
        }

        return generateReportPdf(type, title, summary, invoices);
    }

    private ReportDTO.FinancialSummaryDTO getSummary(LocalDate start, LocalDate end) {
        ReportDTO.FinancialSummaryDTO summary = reportRepository.getFinancialSummary(PaymentStatus.SUCCESS, start, end);
        if (summary == null || summary.getTotalInvoices() == 0) {
            return new ReportDTO.FinancialSummaryDTO(0L, 0.0, 0.0, 0.0);
        }
        // Handle potential nulls from SUM if there are no records (though COUNT(p)
        // should be 0)
        if (summary.getTotalRevenue() == null)
            summary.setTotalRevenue(0.0);
        if (summary.getTotalCommission() == null)
            summary.setTotalCommission(0.0);
        if (summary.getTotalGuidePayout() == null)
            summary.setTotalGuidePayout(0.0);
        return summary;
    }

    private List<ReportDTO.InvoiceSummaryDTO> getInvoices(LocalDate start, LocalDate end) {
        return reportRepository.getInvoiceSummaries(PaymentStatus.SUCCESS, start, end);
    }

    public byte[] generateReportPdf(String type, String title, ReportDTO.FinancialSummaryDTO summary,
            List<ReportDTO.InvoiceSummaryDTO> invoices) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            // Header
            Paragraph header = new Paragraph("TouristConnect Financial Report", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(10);
            document.add(header);

            Paragraph reportTitle = new Paragraph(title, subHeaderFont);
            reportTitle.setAlignment(Element.ALIGN_CENTER);
            reportTitle.setSpacingAfter(20);
            document.add(reportTitle);

            // Summary Table
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);

            summaryTable.addCell(createCell("Total Invoices", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Total Revenue", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Total Commission", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Guide Payout", boldFont, Element.ALIGN_CENTER, true));

            summaryTable.addCell(createCell(summary.getTotalInvoices().toString(), normalFont, Element.ALIGN_CENTER));
            summaryTable.addCell(
                    createCell(String.format("NPR %.2f", summary.getTotalRevenue()), normalFont, Element.ALIGN_CENTER));
            summaryTable.addCell(createCell(String.format("NPR %.2f", summary.getTotalCommission()), normalFont,
                    Element.ALIGN_CENTER));
            summaryTable.addCell(createCell(String.format("NPR %.2f", summary.getTotalGuidePayout()), normalFont,
                    Element.ALIGN_CENTER));

            document.add(summaryTable);

            // Invoices Table
            Paragraph invoiceHeader = new Paragraph("Detailed Invoice List", subHeaderFont);
            invoiceHeader.setSpacingAfter(10);
            document.add(invoiceHeader);

            PdfPTable invoiceTable = new PdfPTable(5);
            invoiceTable.setWidthPercentage(100);
            invoiceTable.setWidths(new float[] { 20, 25, 25, 15, 15 });

            invoiceTable.addCell(createCell("Invoice #", boldFont, Element.ALIGN_LEFT, true));
            invoiceTable.addCell(createCell("Date", boldFont, Element.ALIGN_LEFT, true));
            invoiceTable.addCell(createCell("Customer", boldFont, Element.ALIGN_LEFT, true));
            invoiceTable.addCell(createCell("Amount", boldFont, Element.ALIGN_RIGHT, true));
            invoiceTable.addCell(createCell("Status", boldFont, Element.ALIGN_CENTER, true));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            for (ReportDTO.InvoiceSummaryDTO inv : invoices) {
                invoiceTable.addCell(createCell(inv.getInvoiceNumber(), normalFont, Element.ALIGN_LEFT));
                invoiceTable.addCell(createCell(inv.getDate().format(formatter), normalFont, Element.ALIGN_LEFT));
                invoiceTable.addCell(createCell(inv.getCustomerName(), normalFont, Element.ALIGN_LEFT));
                invoiceTable
                        .addCell(createCell(String.format("%.2f", inv.getAmount()), normalFont, Element.ALIGN_RIGHT));
                invoiceTable.addCell(createCell(inv.getStatus(), normalFont, Element.ALIGN_CENTER));
            }

            document.add(invoiceTable);

            // Footer
            Paragraph footer = new Paragraph("\nGenerated on: " + LocalDateTime.now().format(formatter), normalFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF report", e);
        }

        return out.toByteArray();
    }

    private PdfPCell createCell(String text, Font font, int alignment) {
        return createCell(text, font, alignment, false);
    }

    private PdfPCell createCell(String text, Font font, int alignment, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(alignment);
        if (header) {
            cell.setBackgroundColor(Color.LIGHT_GRAY);
            cell.setBorder(Rectangle.BOX);
        } else {
            cell.setBorder(Rectangle.BOTTOM);
        }
        return cell;
    }
}
