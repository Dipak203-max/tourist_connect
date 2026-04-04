package com.touristconnect.controller;

import com.touristconnect.dto.DestinationResponse;
import com.touristconnect.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/destinations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDestinationController {

    @Autowired
    private DestinationService destinationService;

    @PostMapping
    public ResponseEntity<DestinationResponse> createDestination(
            @RequestBody com.touristconnect.dto.DestinationRequest destinationRequest) {
        return ResponseEntity.ok(destinationService.createDestination(destinationRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DestinationResponse> updateDestination(@PathVariable Long id,
            @RequestBody com.touristconnect.dto.DestinationRequest destinationRequest) {
        return ResponseEntity.ok(destinationService.updateDestination(id, destinationRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.noContent().build();
    }
}
