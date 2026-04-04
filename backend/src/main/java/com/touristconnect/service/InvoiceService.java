package com.touristconnect.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.touristconnect.entity.Booking;
import com.touristconnect.entity.Payment;
import com.touristconnect.entity.User;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public InvoiceService() {
    }

    public byte[] generateInvoicePdf(Payment payment) {
        Booking booking = payment.getBooking();
        if (booking == null) {
            throw new RuntimeException("Booking details missing for payment #" + payment.getId());
        }

        User tourist = booking.getTourist();
        if (tourist == null) {
            throw new RuntimeException("Tourist information missing for booking #" + booking.getId());
        }

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

            // Header
            Paragraph header = new Paragraph("TOURISTCONNECT INVOICE", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(20);
            document.add(header);

            // Invoice Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.addCell(
                    createCell("Invoice Number: " + payment.getInvoiceNumber(), normalFont, Element.ALIGN_LEFT));
            infoTable.addCell(createCell(
                    "Date: " + payment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                    normalFont, Element.ALIGN_RIGHT));
            infoTable.setSpacingAfter(30);
            document.add(infoTable);

            // Billing Info
            Paragraph billingHeader = new Paragraph("BILLING DETAILS", subHeaderFont);
            billingHeader.setSpacingAfter(10);
            document.add(billingHeader);

            document.add(
                    new Paragraph("Customer Name: " + (tourist != null ? tourist.getFullName() : "N/A"), normalFont));
            document.add(
                    new Paragraph("Customer Email: " + (tourist != null ? tourist.getEmail() : "N/A"), normalFont));
            document.add(new Paragraph(
                    "Tour Name: "
                            + (booking.getDestination() != null ? booking.getDestination().getName() : "Custom Tour"),
                    normalFont));
            document.add(new Paragraph(
                    "Guide: " + (booking.getGuide() != null ? booking.getGuide().getFullName() : "N/A"), normalFont));
            document.add(new Paragraph("Booking ID: #" + booking.getId(), normalFont));
            document.add(new Paragraph("Khalti Transaction ID: "
                    + (payment.getTransactionId() != null ? payment.getTransactionId() : "N/A"), normalFont));

            document.add(new Paragraph("\n"));

            // Summary Table
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(10);

            summaryTable.addCell(createCell("Description", boldFont, Element.ALIGN_LEFT, true));
            summaryTable.addCell(createCell("Amount (NPR)", boldFont, Element.ALIGN_RIGHT, true));

            summaryTable.addCell(createCell("Base Tour Package Fee", normalFont, Element.ALIGN_LEFT));
            summaryTable
                    .addCell(createCell(String.format("%.2f", payment.getAmount()), normalFont, Element.ALIGN_RIGHT));

            summaryTable.addCell(createCell("Total Paid", boldFont, Element.ALIGN_LEFT, Color.LIGHT_GRAY));
            summaryTable.addCell(createCell(String.format("%.2f", payment.getAmount()), boldFont, Element.ALIGN_RIGHT,
                    Color.LIGHT_GRAY));

            document.add(summaryTable);

            // Footer
            Paragraph footer = new Paragraph("\n\nThank you for exploring with TouristConnect!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF invoice", e);
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
        cell.setBorder(header ? com.lowagie.text.Rectangle.BOTTOM : com.lowagie.text.Rectangle.NO_BORDER);
        return cell;
    }

    private PdfPCell createCell(String text, Font font, int alignment, Color bgColor) {
        PdfPCell cell = createCell(text, font, alignment);
        cell.setBackgroundColor(bgColor);
        cell.setBorder(com.lowagie.text.Rectangle.BOX);
        return cell;
    }
}
