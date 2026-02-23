package com.mvc.facilitybookingms.controller;

import com.mvc.facilitybookingms.dto.BookingRequestDTO;
import com.mvc.facilitybookingms.dto.BookingResponseDTO;
import com.mvc.facilitybookingms.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "APIs for managing facility bookings")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all bookings", description = "Retrieves a list of all facility bookings")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all bookings",
            content = @Content(schema = @Schema(implementation = BookingResponseDTO.class)))
    public List<BookingResponseDTO> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PostMapping
    @Operation(summary = "Create a new booking", description = "Creates a new facility booking with the provided details")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Booking created successfully",
                content = @Content(schema = @Schema(implementation = BookingResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request body", content = @Content),
        @ApiResponse(responseCode = "409", description = "Facility not available for the requested time slot", content = @Content)
    })
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a booking", description = "Updates an existing booking with the provided details")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking updated successfully",
                content = @Content(schema = @Schema(implementation = BookingResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request body", content = @Content),
        @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable @Parameter(description = "ID of the booking to update") Long id,
            @Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking cancelled successfully", content = @Content),
        @ApiResponse(responseCode = "404", description = "Booking not found", content = @Content)
    })
    public ResponseEntity<String> cancelBooking(
            @PathVariable @Parameter(description = "ID of the booking to cancel") Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("Booking cancelled");
    }

    @GetMapping("/availability")
    @Operation(summary = "Check facility availability",
            description = "Checks if a facility is available for the requested date and time range")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Availability check result returned",
                content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "404", description = "Facility not found", content = @Content)
    })
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam @Parameter(description = "ID of the facility to check") Long facilityId,
            @RequestParam @Parameter(description = "Date to check (YYYY-MM-DD)")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @Parameter(description = "Start time (HH:mm:ss)")
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @Parameter(description = "End time (HH:mm:ss)")
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        return ResponseEntity.ok(bookingService.checkAvailability(facilityId, date, startTime, endTime));
    }
}
