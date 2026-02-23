package com.mvc.facilitybookingms.controller;

import com.mvc.facilitybookingms.dto.FacilityDTO;
import com.mvc.facilitybookingms.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
@Tag(name = "Facilities", description = "APIs for managing facilities")
public class FacilityController {

    private final FacilityService facilityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new facility", description = "Admin only. Creates a new facility.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Facility created successfully",
                content = @Content(schema = @Schema(implementation = FacilityDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request body", content = @Content),
        @ApiResponse(responseCode = "403", description = "Access denied — Admin only", content = @Content)
    })
    public ResponseEntity<FacilityDTO> createFacility(@RequestBody FacilityDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(dto));
    }

    @GetMapping
    @Operation(summary = "Get all facilities", description = "Retrieves a list of all available facilities.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all facilities",
            content = @Content(schema = @Schema(implementation = FacilityDTO.class)))
    public List<FacilityDTO> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a facility by ID", description = "Retrieves a specific facility by its ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Facility found",
                content = @Content(schema = @Schema(implementation = FacilityDTO.class))),
        @ApiResponse(responseCode = "404", description = "Facility not found", content = @Content)
    })
    public FacilityDTO getFacility(
            @PathVariable @Parameter(description = "ID of the facility") Long id) {
        return facilityService.getFacilityById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a facility", description = "Admin only. Updates an existing facility.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Facility updated successfully",
                content = @Content(schema = @Schema(implementation = FacilityDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request body", content = @Content),
        @ApiResponse(responseCode = "403", description = "Access denied — Admin only", content = @Content),
        @ApiResponse(responseCode = "404", description = "Facility not found", content = @Content)
    })
    public ResponseEntity<FacilityDTO> updateFacility(
            @PathVariable @Parameter(description = "ID of the facility to update") Long id,
            @RequestBody FacilityDTO dto) {
        return ResponseEntity.ok(facilityService.updateFacility(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a facility", description = "Admin only. Deletes an existing facility.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Facility deleted successfully", content = @Content),
        @ApiResponse(responseCode = "403", description = "Access denied — Admin only", content = @Content),
        @ApiResponse(responseCode = "404", description = "Facility not found", content = @Content)
    })
    public ResponseEntity<String> deleteFacility(
            @PathVariable @Parameter(description = "ID of the facility to delete") Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok("Facility deleted");
    }
}
