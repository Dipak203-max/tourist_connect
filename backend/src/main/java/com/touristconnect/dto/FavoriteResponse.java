package com.touristconnect.dto;

import com.touristconnect.entity.FavoriteType;
import java.time.LocalDateTime;

public class FavoriteResponse {
    private Long id;
    private Long itemId;
    private FavoriteType itemType;
    private LocalDateTime createdAt;
    private Object details;

    public FavoriteResponse() {
    }

    public FavoriteResponse(Long id, Long itemId, FavoriteType itemType, LocalDateTime createdAt, Object details) {
        this.id = id;
        this.itemId = itemId;
        this.itemType = itemType;
        this.createdAt = createdAt;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public FavoriteType getItemType() {
        return itemType;
    }

    public void setItemType(FavoriteType itemType) {
        this.itemType = itemType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Object getDetails() {
        return details;
    }

    public void setDetails(Object details) {
        this.details = details;
    }
}
