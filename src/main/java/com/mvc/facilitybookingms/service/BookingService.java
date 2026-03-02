package com.mvc.facilitybookingms.service;

import com.mvc.facilitybookingms.dto.BookingRequestDTO;
import com.mvc.facilitybookingms.dto.BookingResponseDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO request);

    List<BookingResponseDTO> getAllBookings();

    void cancelBooking(Long id);

    boolean checkAvailability(Long facilityId,
                              LocalDate date,
                              LocalTime startTime,
                              LocalTime endTime);

    BookingResponseDTO updateBooking(Long id, BookingRequestDTO request);

    List<BookingResponseDTO> getBookingsForUser(Long userId);
}
