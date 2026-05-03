package com.touristconnect.service;

import com.touristconnect.dto.ItineraryDto;
import com.touristconnect.entity.*;
import com.touristconnect.repository.ItineraryRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ItineraryDto createItinerary(String email, ItineraryDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Itinerary itinerary = new Itinerary(user, dto.getTitle(), dto.getStartDate(), dto.getEndDate());

        // Populate days
        if (dto.getDays() != null) {
            for (ItineraryDto.ItineraryDayDto dayDto : dto.getDays()) {
                ItineraryDay day = new ItineraryDay(dayDto.getDayNumber());
                day.setNotes(dayDto.getNotes());

                if (dayDto.getItems() != null) {
                    for (ItineraryDto.ItineraryItemDto itemDto : dayDto.getItems()) {
                        ItineraryItem item = new ItineraryItem(
                                ItineraryItem.ItemType.valueOf(itemDto.getType()),
                                itemDto.getReferenceId(),
                                itemDto.getDescription(),
                                itemDto.getTimeSlot());
                        day.addItem(item);
                    }
                }
                itinerary.addDay(day);
            }
        }

        Itinerary saved = itineraryRepository.save(itinerary);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ItineraryDto> getMyItineraries(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return itineraryRepository.findByUserOrderByIdDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItineraryDto getItinerary(Long id) {
        java.util.Objects.requireNonNull(id, "Itinerary ID must not be null");
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        return mapToDto(itinerary);
    }

    @Transactional
    public void deleteItinerary(Long id, String email) {
        java.util.Objects.requireNonNull(id, "Itinerary ID must not be null");
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        itineraryRepository.delete(itinerary);
    }

    @Transactional
    public ItineraryDto shareItinerary(Long id, String email) {
        java.util.Objects.requireNonNull(id, "Itinerary ID must not be null");
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        itinerary.setShared(true);
        if (itinerary.getShareToken() == null) {
            itinerary.setShareToken(java.util.UUID.randomUUID().toString());
        }

        return mapToDto(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDto addDay(Long id, String email) {
        java.util.Objects.requireNonNull(id, "Itinerary ID must not be null");
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        // Calculate max allowed days
        long maxDays = java.time.temporal.ChronoUnit.DAYS.between(itinerary.getStartDate(), itinerary.getEndDate()) + 1;
        if (itinerary.getDays().size() >= maxDays) {
            throw new RuntimeException("Cannot add more days than the date range allows (" + maxDays + " days)");
        }

        int nextDayNumber = itinerary.getDays().size() + 1;
        ItineraryDay newDay = new ItineraryDay(nextDayNumber);
        itinerary.addDay(newDay);

        return mapToDto(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDto addItem(Long dayId, ItineraryDto.ItineraryItemDto itemDto, String email) {

        throw new RuntimeException("Method signature mismatch - see correction");
    }

    @Transactional
    public ItineraryDto addItemToDay(Long itineraryId, Long dayId, ItineraryDto.ItineraryItemDto itemDto,
            String email) {
        java.util.Objects.requireNonNull(itineraryId, "Itinerary ID required");
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        ItineraryDay day = itinerary.getDays().stream()
                .filter(d -> d.getId().equals(dayId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Day not found in this itinerary"));

        ItineraryItem item = new ItineraryItem(
                ItineraryItem.ItemType.valueOf(itemDto.getType()),
                itemDto.getReferenceId(),
                itemDto.getDescription(),
                itemDto.getTimeSlot(),
                itemDto.getPinned() != null ? itemDto.getPinned() : false);

        day.addItem(item);
        return mapToDto(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDto updateItinerary(Long id, ItineraryDto dto, String email) {
        java.util.Objects.requireNonNull(id, "Itinerary ID must not be null");
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        itinerary.setTitle(dto.getTitle());
        itinerary.setStartDate(dto.getStartDate());
        itinerary.setEndDate(dto.getEndDate());

        return mapToDto(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDto updateItem(Long itineraryId, Long dayId, Long itemId, ItineraryDto.ItineraryItemDto itemDto,
            String email) {
        java.util.Objects.requireNonNull(itineraryId, "Itinerary ID required");
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        ItineraryDay day = itinerary.getDays().stream()
                .filter(d -> d.getId().equals(dayId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Day not found in this itinerary"));

        ItineraryItem item = day.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Update fields if provided
        if (itemDto.getDescription() != null)
            item.setDescription(itemDto.getDescription());
        if (itemDto.getTimeSlot() != null)
            item.setTimeSlot(itemDto.getTimeSlot());
        // Always update pinned status as it's a boolean and present in DTO
        item.setPinned(itemDto.getPinned() != null ? itemDto.getPinned() : false);

        return mapToDto(itineraryRepository.save(itinerary));
    }

    @Transactional
    public void deleteItem(Long itineraryId, Long dayId, Long itemId, String email) {
        java.util.Objects.requireNonNull(itineraryId, "Itinerary ID required");
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        ItineraryDay day = itinerary.getDays().stream()
                .filter(d -> d.getId().equals(dayId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Day not found in this itinerary"));

        ItineraryItem item = day.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found"));

        day.getItems().remove(item);
        itineraryRepository.save(itinerary);
    }

    @Transactional(readOnly = true)
    public ItineraryDto getItineraryByToken(String token) {
        Itinerary itinerary = itineraryRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Itinerary not found or invalid token"));
        return mapToDto(itinerary);
    }

    private ItineraryDto mapToDto(Itinerary itinerary) {
        List<ItineraryDto.ItineraryDayDto> dayDtos = itinerary.getDays().stream()
                .map(day -> {
                    List<ItineraryDto.ItineraryItemDto> itemDtos = day.getItems().stream()
                            .sorted((a, b) -> {
                                // Sort by Pinned (desc), then TimeSlot (asc)
                                boolean p1 = a.getPinned() != null ? a.getPinned() : false;
                                boolean p2 = b.getPinned() != null ? b.getPinned() : false;

                                if (p1 != p2) {
                                    return p1 ? -1 : 1;
                                }
                                String t1 = a.getTimeSlot() == null ? "" : a.getTimeSlot();
                                String t2 = b.getTimeSlot() == null ? "" : b.getTimeSlot();
                                return t1.compareTo(t2);
                            })
                            .map(item -> new ItineraryDto.ItineraryItemDto(
                                    item.getId(),
                                    item.getType().name(),
                                    item.getReferenceId(),
                                    item.getDescription(),
                                    item.getTimeSlot(),
                                    item.getPinned() != null ? item.getPinned() : false))
                            .collect(Collectors.toList());

                    return new ItineraryDto.ItineraryDayDto(
                            day.getId(),
                            day.getDayNumber(),
                            day.getNotes(),
                            itemDtos);
                })
                .collect(Collectors.toList());


        return new ItineraryDto(
                itinerary.getId(),
                itinerary.getTitle(),
                itinerary.getStartDate(),
                itinerary.getEndDate(),
                itinerary.isShared(),
                itinerary.getShareToken(), 
                dayDtos);
    }
}
