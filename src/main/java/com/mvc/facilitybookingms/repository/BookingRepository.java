package com.mvc.facilitybookingms.repository;

import com.mvc.facilitybookingms.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
        AND b.status != 'CANCELLED'
    """)
    List<Booking> findConflictingBookings(
            @Param("facilityId") Long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.user.id = :userId
        AND b.status != 'CANCELLED'
    """)
    List<Booking> findByUserId(@Param("userId") Long userId);
}
