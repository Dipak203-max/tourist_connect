package com.touristconnect.dto;

import com.touristconnect.entity.FavoriteType;
import jakarta.validation.constraints.NotNull;

public class FavoriteRequest {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Item type is required")
    private FavoriteType itemType;

    public FavoriteRequest() {
    }

    public FavoriteRequest(Long itemId, FavoriteType itemType) {
        this.itemId = itemId;
        this.itemType = itemType;
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
}
