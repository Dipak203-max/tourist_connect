package com.touristconnect.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary_days")
public class ItineraryDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @Column(name = "day_number")
    private int dayNumber;

    private String notes;

    @OneToMany(mappedBy = "itineraryDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItineraryItem> items = new ArrayList<>();

    // Constructors
    public ItineraryDay() {
    }

    public ItineraryDay(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    // Helpers
    public void addItem(ItineraryItem item) {
        items.add(item);
        item.setItineraryDay(this);
    }

    public void removeItem(ItineraryItem item) {
        items.remove(item);
        item.setItineraryDay(null);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Itinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(Itinerary itinerary) {
        this.itinerary = itinerary;
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

    public List<ItineraryItem> getItems() {
        return items;
    }

    public void setItems(List<ItineraryItem> items) {
        this.items = items;
    }
}
