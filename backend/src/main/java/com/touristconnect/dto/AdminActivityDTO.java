package com.touristconnect.dto;

import com.touristconnect.entity.AdminActivityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminActivityDTO {
    private Long id;
    private AdminActivityType type;
    private String description;
    private String userName;
    private String userEmail;
    private String referenceId;
    private LocalDateTime createdAt;
}
