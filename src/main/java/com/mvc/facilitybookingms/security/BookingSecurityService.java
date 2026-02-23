package com.mvc.facilitybookingms.security;

import com.mvc.facilitybookingms.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("bookingSecurity")
@RequiredArgsConstructor
public class BookingSecurityService {

    private final BookingRepository bookingRepository;

    public boolean isOwner(Long bookingId, String email) {
        return bookingRepository.findById(bookingId)
                .map(booking -> booking.getUser() != null
                        && booking.getUser().getEmail().equals(email))
                .orElse(false);
    }
}
