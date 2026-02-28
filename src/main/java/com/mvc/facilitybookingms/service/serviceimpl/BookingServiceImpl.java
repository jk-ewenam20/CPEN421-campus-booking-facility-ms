package com.mvc.facilitybookingms.service.serviceimpl;

import com.mvc.facilitybookingms.dto.BookingRequestDTO;
import com.mvc.facilitybookingms.dto.BookingResponseDTO;
import com.mvc.facilitybookingms.model.Booking;
import com.mvc.facilitybookingms.model.Facility;
import com.mvc.facilitybookingms.model.User;
import com.mvc.facilitybookingms.repository.BookingRepository;
import com.mvc.facilitybookingms.repository.FacilityRepository;
import com.mvc.facilitybookingms.repository.UserRepository;
import com.mvc.facilitybookingms.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Invalid time range");
        }

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        request.getFacilityId(),
                        request.getDate(),
                        request.getStartTime(),
                        request.getEndTime()
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked");
        }

        Booking booking = new Booking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus("CONFIRMED");

        Booking saved = bookingRepository.save(booking);

        return mapToResponse(saved);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    @Override
    public boolean checkAvailability(Long facilityId,
                                     LocalDate date,
                                     LocalTime startTime,
                                     LocalTime endTime) {

        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        facilityId, date, startTime, endTime);

        return conflicts.isEmpty();
    }

    @Override
    public BookingResponseDTO updateBooking(Long id, BookingRequestDTO request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Invalid time range");
        }

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> conflicts =
                bookingRepository.findConflictingBookings(
                        request.getFacilityId(),
                        request.getDate(),
                        request.getStartTime(),
                        request.getEndTime()
                );

        if (!conflicts.isEmpty() && conflicts.stream().noneMatch(b -> b.getId().equals(id))) {
            throw new RuntimeException("Time slot already booked");
        }

        booking.setFacility(facility);
        booking.setUser(user);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus("UPDATED");

        Booking updated = bookingRepository.save(booking);

        return mapToResponse(updated);
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        return new BookingResponseDTO(
                booking.getId(),
                booking.getUser().getId(),
                booking.getFacility().getName(),
                booking.getUser().getName(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus()
        );
    }
}

