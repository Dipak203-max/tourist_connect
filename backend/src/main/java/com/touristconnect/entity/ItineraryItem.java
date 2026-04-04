package com.touristconnect.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itinerary_items")
public class ItineraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_day_id", nullable = false)
    private ItineraryDay itineraryDay;

    @Enumerated(EnumType.STRING)
    private ItemType type; // PLACE, GUIDE, ACTIVITY

    @Column(name = "reference_id")
    private Long referenceId; // ID of the Guide/Place

    @Column(name = "description")
    private String description; // Name of the place/guide for display

    @Column(name = "time_slot")
    private String timeSlot; // e.g., "10:00 AM"

    @Column(name = "pinned")
    private Boolean pinned = false;

    public enum ItemType {
        PLACE, GUIDE, ACTIVITY
    }

    // Constructors
    public ItineraryItem() {
    }

    public ItineraryItem(ItemType type, Long referenceId, String description, String timeSlot) {
        this.type = type;
        this.referenceId = referenceId;
        this.description = description;
        this.timeSlot = timeSlot;
        this.pinned = false; // Default
    }

    public ItineraryItem(ItemType type, Long referenceId, String description, String timeSlot, Boolean pinned) {
        this.type = type;
        this.referenceId = referenceId;
        this.description = description;
        this.timeSlot = timeSlot;
        this.pinned = pinned != null ? pinned : false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItineraryDay getItineraryDay() {
        return itineraryDay;
    }

    public void setItineraryDay(ItineraryDay itineraryDay) {
        this.itineraryDay = itineraryDay;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
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
        return pinned != null ? pinned : false;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned != null ? pinned : false;
    }
}
