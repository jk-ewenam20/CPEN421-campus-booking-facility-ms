package com.mvc.facilitybookingms.dto;

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
    private LocalDate date;      // ISO-8601: "yyyy-MM-dd"

    @NotNull
    private LocalTime startTime; // ISO-8601: "HH:mm:ss"

    @NotNull
    private LocalTime endTime;   // ISO-8601: "HH:mm:ss"
}
