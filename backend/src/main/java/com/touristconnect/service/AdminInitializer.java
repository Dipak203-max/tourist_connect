package com.touristconnect.service;

import com.touristconnect.entity.Role;
import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initAdmin() {
        String adminEmail = "dtolangi2@gmail.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Dipak123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true); // Enabled by default
            admin.setOtp(null);
            admin.setOtpExpiry(null);

            userRepository.save(admin);
            System.out.println("Default Admin User created: " + adminEmail);
        } else {
            System.out.println("Admin User already exists.");
        }
    }
}
