package com.touristconnect.dto;

public class PhoneRegisterRequest {
    private String phoneNumber;

    public PhoneRegisterRequest() {
    }

    public PhoneRegisterRequest(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
