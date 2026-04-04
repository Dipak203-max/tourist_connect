package com.touristconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("TouristConnect Verification OTP");
        message.setText("Your verification OTP is: " + otp + "\n\nThis OTP expires in 5 minutes.");
        mailSender.send(message);
    }

    public void sendResetTokenEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("TouristConnect Password Reset");
        message.setText(
                "To reset your password, use the following token: " + token + "\n\nThis token expires in 15 minutes.");
        mailSender.send(message);
    }
}
