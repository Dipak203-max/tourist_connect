package com.touristconnect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String apiKey;

    private final String RESEND_URL = "https://api.resend.com/emails";

    private void sendEmail(String to, String subject, String htmlContent) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("from", "TouristConnect <onboarding@resend.dev>");
        body.put("to", to);
        body.put("subject", subject);
        body.put("html", htmlContent);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        org.springframework.http.HttpEntity<Map<String, Object>> request =
                new org.springframework.http.HttpEntity<>(body, headers);

        restTemplate.postForEntity(RESEND_URL, request, String.class);

        System.out.println("✅ Email sent to: " + to);
    }

    // ✅ SAME METHOD (OTP)
    public void sendOtpEmail(String to, String otp) {
        String html =
                "<h2>TouristConnect OTP</h2>" +
                "<p>Your OTP is: <b>" + otp + "</b></p>" +
                "<p>This OTP expires in 5 minutes.</p>";

        sendEmail(to, "TouristConnect Verification OTP", html);
    }

    // ✅ SAME METHOD (RESET)
    public void sendResetTokenEmail(String to, String token) {
        String html =
                "<h2>Password Reset</h2>" +
                "<p>Your reset token is: <b>" + token + "</b></p>" +
                "<p>This token expires in 15 minutes.</p>";

        sendEmail(to, "TouristConnect Password Reset", html);
    }
}