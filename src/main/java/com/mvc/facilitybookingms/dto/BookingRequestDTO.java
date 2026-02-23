package com.mvc.facilitybookingms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BookingRequestDTO {

    @NotNull
    private Long facilityId;

    @NotNull
    private Long userId;

    @NotNull
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    // Expected format: "yyyy-MM-dd" (e.g., "2026-02-17")
    private LocalDate date;

    @NotNull
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    // Expected format: "HH:mm:ss" (e.g., "14:30:00")
    private LocalTime startTime;

    @NotNull
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    // Expected format: "HH:mm:ss" (e.g., "15:30:00")
    private LocalTime endTime;
}
