package com.mvc.facilitybookingms.repository;

import com.mvc.facilitybookingms.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b FROM Booking b
        WHERE b.facility.id = :facilityId
        AND b.date = :date
        AND b.startTime < :endTime
        AND b.endTime > :startTime
    """)
    List<Booking> findConflictingBookings(
            Long facilityId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    );
}

