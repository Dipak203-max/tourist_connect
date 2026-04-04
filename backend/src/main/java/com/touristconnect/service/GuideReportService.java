package com.touristconnect.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.touristconnect.dto.GuideReportDTO;
import com.touristconnect.entity.PaymentStatus;
import com.touristconnect.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuideReportService {

    private final ReportRepository reportRepository;
    private final List<PaymentStatus> SUCCESS_STATUSES = Arrays.asList(PaymentStatus.SUCCESS);

    public GuideReportDTO.DailyReportDTO getDailyReport(String email, String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return new GuideReportDTO.DailyReportDTO(
                getSummary(email, date, date),
                getBookings(email, date, date));
    }

    public GuideReportDTO.MonthlyReportDTO getMonthlyReport(String email, int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        return new GuideReportDTO.MonthlyReportDTO(
                getSummary(email, firstDay, lastDay),
                getBookings(email, firstDay, lastDay));
    }

    public GuideReportDTO.YearlyReportDTO getYearlyReport(String email, int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return new GuideReportDTO.YearlyReportDTO(
                getSummary(email, start, end),
                getBookings(email, start, end));
    }

    private GuideReportDTO.FinancialSummaryDTO getSummary(String email, LocalDate start, LocalDate end) {
        GuideReportDTO.FinancialSummaryDTO summary = reportRepository.getGuideFinancialSummary(email, SUCCESS_STATUSES,
                start, end);
        if (summary == null || summary.getTotalBookings() == 0) {
            return new GuideReportDTO.FinancialSummaryDTO(0L, 0.0, 0.0, 0.0);
        }
        if (summary.getTotalRevenue() == null)
            summary.setTotalRevenue(0.0);
        if (summary.getTotalCommission() == null)
            summary.setTotalCommission(0.0);
        if (summary.getTotalPayout() == null)
            summary.setTotalPayout(0.0);
        return summary;
    }

    private List<GuideReportDTO.BookingSummaryDTO> getBookings(String email, LocalDate start, LocalDate end) {
        return reportRepository.getGuideBookingSummaries(email, SUCCESS_STATUSES, start, end);
    }

    public byte[] generateGuideReportPdf(String email, String type, int year, Integer month) {
        GuideReportDTO.FinancialSummaryDTO summary;
        List<GuideReportDTO.BookingSummaryDTO> bookings;
        String title;

        if ("monthly".equalsIgnoreCase(type)) {
            GuideReportDTO.MonthlyReportDTO monthly = getMonthlyReport(email, year, month);
            summary = monthly.getSummary();
            bookings = monthly.getBookings();
            title = "Monthly Earnings Report - " + year + "-" + String.format("%02d", month);
        } else if ("yearly".equalsIgnoreCase(type)) {
            GuideReportDTO.YearlyReportDTO yearly = getYearlyReport(email, year);
            summary = yearly.getSummary();
            bookings = yearly.getBookings();
            title = "Yearly Earnings Report - " + year;
        } else {
            summary = new GuideReportDTO.FinancialSummaryDTO(0L, 0.0, 0.0, 0.0);
            bookings = java.util.Collections.emptyList();
            title = "Earnings Report";
        }

        return generatePdf(title, summary, bookings);
    }

    private byte[] generatePdf(String title, GuideReportDTO.FinancialSummaryDTO summary,
            List<GuideReportDTO.BookingSummaryDTO> bookings) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            Paragraph header = new Paragraph("TouristConnect Guide Earnings", headerFont);
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

            summaryTable.addCell(createCell("Total Bookings", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Total Revenue", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Commission", boldFont, Element.ALIGN_CENTER, true));
            summaryTable.addCell(createCell("Your Net Payout", boldFont, Element.ALIGN_CENTER, true));

            summaryTable.addCell(
                    createCell(summary.getTotalBookings().toString(), normalFont, Element.ALIGN_CENTER, false));
            summaryTable.addCell(
                    createCell(String.format("NPR %.2f", summary.getTotalRevenue()), normalFont, Element.ALIGN_CENTER,
                            false));
            summaryTable.addCell(createCell(String.format("NPR %.2f", summary.getTotalCommission()), normalFont,
                    Element.ALIGN_CENTER, false));
            summaryTable.addCell(
                    createCell(String.format("NPR %.2f", summary.getTotalPayout()), normalFont, Element.ALIGN_CENTER,
                            false));

            document.add(summaryTable);

            // Bookings Table
            Paragraph bookingHeader = new Paragraph("Paid Bookings List", subHeaderFont);
            bookingHeader.setSpacingAfter(10);
            document.add(bookingHeader);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 20, 25, 25, 15, 15 });

            table.addCell(createCell("Invoice #", boldFont, Element.ALIGN_LEFT, true));
            table.addCell(createCell("Date", boldFont, Element.ALIGN_LEFT, true));
            table.addCell(createCell("Tourist", boldFont, Element.ALIGN_LEFT, true));
            table.addCell(createCell("Amount (NPR)", boldFont, Element.ALIGN_RIGHT, true));
            table.addCell(createCell("Status", boldFont, Element.ALIGN_CENTER, true));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            for (GuideReportDTO.BookingSummaryDTO b : bookings) {
                table.addCell(createCell(b.getInvoiceNumber(), normalFont, Element.ALIGN_LEFT, false));
                table.addCell(createCell(b.getDate().format(formatter), normalFont, Element.ALIGN_LEFT, false));
                table.addCell(createCell(b.getTouristName(), normalFont, Element.ALIGN_LEFT, false));
                table.addCell(createCell(String.format("%.2f", b.getAmount()), normalFont, Element.ALIGN_RIGHT, false));
                table.addCell(createCell(b.getStatus(), normalFont, Element.ALIGN_CENTER, false));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Guide PDF report", e);
        }

        return out.toByteArray();
    }

    private PdfPCell createCell(String text, Font font, int alignment, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(alignment);
        if (header) {
            cell.setBackgroundColor(Color.LIGHT_GRAY);
        }
        return cell;
    }
}
