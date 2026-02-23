package com.mvc.facilitybookingms.service;

import com.mvc.facilitybookingms.dto.FacilityDTO;

import java.util.List;

public interface FacilityService {

    FacilityDTO createFacility(FacilityDTO dto);

    List<FacilityDTO> getAllFacilities();

    FacilityDTO getFacilityById(Long id);

    void deleteFacility(Long id);

    FacilityDTO updateFacility(Long id, FacilityDTO dto);
}
