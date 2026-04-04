package com.touristconnect.dto;

import java.time.LocalDate;
import java.util.List;

public class ItineraryDto {
    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isShared;
    private String shareToken;
    private List<ItineraryDayDto> days;

    public ItineraryDto() {
    }

    public ItineraryDto(Long id, String title, LocalDate startDate, LocalDate endDate, boolean isShared,
            String shareToken,
            List<ItineraryDayDto> days) {
        this.id = id;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isShared = isShared;
        this.shareToken = shareToken;
        this.days = days;
    }

    // Getters and Setters
    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isShared() {
        return isShared;
    }

    public void setShared(boolean shared) {
        isShared = shared;
    }

    public List<ItineraryDayDto> getDays() {
        return days;
    }

    public void setDays(List<ItineraryDayDto> days) {
        this.days = days;
    }

    public static class ItineraryDayDto {
        private Long id;
        private int dayNumber;
        private String notes;
        private List<ItineraryItemDto> items;

        public ItineraryDayDto() {
        }

        public ItineraryDayDto(Long id, int dayNumber, String notes, List<ItineraryItemDto> items) {
            this.id = id;
            this.dayNumber = dayNumber;
            this.notes = notes;
            this.items = items;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public int getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(int dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public List<ItineraryItemDto> getItems() {
            return items;
        }

        public void setItems(List<ItineraryItemDto> items) {
            this.items = items;
        }
    }

    public static class ItineraryItemDto {
        private Long id;
        private String type;
        private Long referenceId;
        private String description;
        private String timeSlot;
        private Boolean pinned;

        public ItineraryItemDto() {
        }

        public ItineraryItemDto(Long id, String type, Long referenceId, String description, String timeSlot,
                Boolean pinned) {
            this.id = id;
            this.type = type;
            this.referenceId = referenceId;
            this.description = description;
            this.timeSlot = timeSlot;
            this.pinned = pinned;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Long getReferenceId() {
            return referenceId;
        }

        public void setReferenceId(Long referenceId) {
            this.referenceId = referenceId;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getTimeSlot() {
            return timeSlot;
        }

        public void setTimeSlot(String timeSlot) {
            this.timeSlot = timeSlot;
        }

        public Boolean getPinned() {
            return pinned;
        }

        public void setPinned(Boolean pinned) {
            this.pinned = pinned;
        }
    }
}
