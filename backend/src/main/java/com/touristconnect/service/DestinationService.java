package com.touristconnect.service;

import com.touristconnect.dto.DestinationResponse;
import com.touristconnect.entity.Destination;
import com.touristconnect.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DestinationService {

    @Autowired
    private DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<DestinationResponse> getAllDestinations(int page, int size) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("createdAt").descending());

        org.springframework.data.domain.Page<Destination> destinationPage = destinationRepository.findAll(pageRequest);
        System.out.println("Destinations page count: " + destinationPage.getTotalElements());

        return destinationPage.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        return mapToResponse(destination);
    }

    @Transactional(readOnly = true)
    public List<DestinationResponse> searchByCity(String city) {
        return destinationRepository.findByCityIgnoreCase(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DestinationResponse createDestination(com.touristconnect.dto.DestinationRequest request) {
        Destination destination = new Destination(
                request.getName(),
                request.getDescription(),
                request.getCity(),
                request.getCountry(),
                request.getLatitude(),
                request.getLongitude(),
                request.getImageUrl());
        Destination saved = destinationRepository.save(destination);
        return mapToResponse(saved);
    }

    @Transactional
    public DestinationResponse updateDestination(Long id, com.touristconnect.dto.DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        destination.setName(request.getName());
        destination.setDescription(request.getDescription());
        destination.setCity(request.getCity());
        destination.setCountry(request.getCountry());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        destination.setImageUrl(request.getImageUrl());

        Destination updated = destinationRepository.save(destination);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteDestination(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        destinationRepository.delete(destination);
    }

    private DestinationResponse mapToResponse(Destination destination) {
        return new DestinationResponse(
                destination.getId(),
                destination.getName(),
                destination.getDescription(),
                destination.getCity(),
                destination.getCountry(),
                destination.getLatitude(),
                destination.getLongitude(),
                destination.getImageUrl(),
                destination.getCreatedAt());
    }
}
