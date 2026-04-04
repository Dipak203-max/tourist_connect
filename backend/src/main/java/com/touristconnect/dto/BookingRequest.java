package com.touristconnect.dto;

import java.time.LocalDate;

public class BookingRequest {
    private Long guideId;
    private LocalDate date;
    private Long tourId;
    private Integer travelers = 1;

    public BookingRequest() {
    }

    public BookingRequest(Long guideId, LocalDate date) {
        this.guideId = guideId;
        this.date = date;
    }

    public Long getGuideId() {
        return guideId;
    }

    public void setGuideId(Long guideId) {
        this.guideId = guideId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }

    public Integer getTravelers() {
        return travelers;
    }

    public void setTravelers(Integer travelers) {
        this.travelers = travelers;
    }
}
