package com.touristconnect.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class GroupResponseDto {
    private Long id;
    private String name;
    private UserSummaryDto createdBy;
    private Set<UserSummaryDto> members;
    private LocalDateTime createdAt;

    public GroupResponseDto() {
    }

    public GroupResponseDto(Long id, String name, UserSummaryDto createdBy, Set<UserSummaryDto> members,
            LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.members = members;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserSummaryDto getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserSummaryDto createdBy) {
        this.createdBy = createdBy;
    }

    public Set<UserSummaryDto> getMembers() {
        return members;
    }

    public void setMembers(Set<UserSummaryDto> members) {
        this.members = members;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
