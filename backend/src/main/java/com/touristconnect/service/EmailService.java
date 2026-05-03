package com.touristconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("TouristConnect Verification OTP");
            message.setText("Your verification OTP is: " + otp + "\n\nThis OTP expires in 5 minutes.");
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email delivery failed. Please check your internet connection or try again later.");
        }
    }

    public void sendResetTokenEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("TouristConnect Password Reset");
            message.setText(
                    "To reset your password, use the following OTP: " + otp + "\n\nThis OTP expires in 15 minutes.");
            mailSender.send(message);
            log.info("Reset email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email delivery failed. Please check your internet connection or try again later.");
        }
    }
}
