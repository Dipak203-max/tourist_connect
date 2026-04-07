package com.touristconnect.service;

import com.touristconnect.config.JwtUtil;
import com.touristconnect.entity.Role;
import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Pattern;
import com.touristconnect.dto.*;
import com.touristconnect.entity.AuthProvider;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.touristconnect.exception.ResourceNotFoundException;
import com.touristconnect.exception.UnauthorizedAccessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserService userService;
    @Autowired
    private AdminDashboardService adminDashboardService;

    @Value("${google.client.id}")
    private String googleClientId;

    private static final HttpTransport transport = new NetHttpTransport();
    private static final JsonFactory jsonFactory = new GsonFactory();

    public String register(RegisterRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);

if (existingUser != null) {
    if (existingUser.isEnabled()) {
        throw new RuntimeException("Email already in use");
    } else {
        // 🔁 RESEND OTP for unverified user
        validatePasswordComplexity(request.getPassword());

        existingUser.setPassword(passwordEncoder.encode(request.getPassword()));

        String otp = String.format("%06d", new Random().nextInt(999999));
        existingUser.setOtp(otp);
        existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        existingUser.setRole(request.getRole());

        userService.saveUser(existingUser);

        emailService.sendOtpEmail(existingUser.getEmail(), otp);

        return "OTP resent successfully";
    }
}

        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin registration is not allowed");
        }

        validatePasswordComplexity(request.getPassword());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEnabled(false); // Disabled until OTP verification

        // Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userService.saveUser(user);

        // Send Email
        emailService.sendOtpEmail(user.getEmail(), otp);

        return "Registration successful. Please verify your email with the OTP sent.";
    }

    public String verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            return "User already verified";
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEnabled(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userService.saveUser(user);

        adminDashboardService.logActivity(
                com.touristconnect.entity.AdminActivityType.USER_REGISTERED,
                "New user registered via Email: " + user.getEmail(),
                user,
                user.getId().toString());

        return "Email verified successfully. You can now login.";
    }

    public String registerPhone(PhoneRegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already in use");
        }

        User user = userRepository.findByPhoneNumber(request.getPhoneNumber()).orElse(new User());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.TOURIST); // Default role for phone registration
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for phone users
        user.setEnabled(false);

        // Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userService.saveUser(user);

        // In a real app, send SMS here. For now, we log it.
        System.out.println("OTP for " + request.getPhoneNumber() + ": " + otp);

        return "OTP sent to phone (Simulated: Check console).";
    }

    public String verifyPhoneOtp(PhoneVerifyRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            return "User already verified";
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEnabled(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userService.saveUser(user);

        adminDashboardService.logActivity(
                com.touristconnect.entity.AdminActivityType.USER_REGISTERED,
                "New user registered via Phone: " + user.getPhoneNumber(),
                user,
                user.getId().toString());

        return "Phone verified successfully.";
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        if (googleClientId == null || googleClientId.equals("placeholder")) {
            System.err.println("Google Login Error: googleClientId is not configured.");
            throw new RuntimeException("Google Login is not configured on the server. Please check the backend configuration.");
        }
        try {
            System.out.println("Attempting Google Token Verification...");
            System.out.println("Using Client ID: " + googleClientId);
            
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                System.err.println("Google ID Token Verification Failed: verifier.verify(token) returned null.");
                throw new RuntimeException("Invalid Google ID Token (Verification failed)");
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleUserId = payload.getSubject();

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setRole(Role.TOURIST);
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setProviderId(googleUserId);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setEnabled(true);
                userService.saveUser(user);

                adminDashboardService.logActivity(
                        com.touristconnect.entity.AdminActivityType.USER_REGISTERED,
                        "New user registered via Google: " + user.getEmail(),
                        user,
                        user.getId().toString());
            } else {
                // Update provider details if it was previously LOCAL but now using GOOGLE
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    user.setAuthProvider(AuthProvider.GOOGLE);
                    user.setProviderId(googleUserId);
                    userService.saveUser(user);
                }
            }

            String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getAuthProvider().name(),
                    user.getId());
            return new AuthResponse(jwt, user.getRole());
        } catch (Exception e) {
            throw new RuntimeException("Google Login Failed: " + e.getMessage());
        }
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setOtp(token);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        emailService.sendResetTokenEmail(user.getEmail(), token);
        return "Password reset link sent to email.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByOtp(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired");
        }

        validatePasswordComplexity(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userService.saveUser(user);

        return "Password reset successful";
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please verify your email.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getAuthProvider().name(),
                user.getId());
        return new AuthResponse(token, user.getRole());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validatePasswordComplexity(String password) {
        // Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
        String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
        if (!Pattern.matches(regex, password)) {
            throw new RuntimeException(
                    "Password must be at least 8 characters, contain one uppercase, one lowercase, one number and one special character.");
        }
    }
}
