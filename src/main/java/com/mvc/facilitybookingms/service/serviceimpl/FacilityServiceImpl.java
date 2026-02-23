package com.mvc.facilitybookingms.service.serviceimpl;

import com.mvc.facilitybookingms.dto.FacilityDTO;
import com.mvc.facilitybookingms.model.Facility;
import com.mvc.facilitybookingms.repository.FacilityRepository;
import com.mvc.facilitybookingms.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    @Override
    public FacilityDTO createFacility(FacilityDTO dto) {

        Facility facility = new Facility();
        facility.setName(dto.getName());
        facility.setLocation(dto.getLocation());
        facility.setCapacity(dto.getCapacity());

        Facility saved = facilityRepository.save(facility);

        return new FacilityDTO(
                saved.getId(),
                saved.getName(),
                saved.getLocation(),
                saved.getCapacity()
        );
    }

    @Override
    public List<FacilityDTO> getAllFacilities() {
        return facilityRepository.findAll()
                .stream()
                .map(f -> new FacilityDTO(
                        f.getId(),
                        f.getName(),
                        f.getLocation(),
                        f.getCapacity()))
                .toList();
    }

    @Override
    public FacilityDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        return new FacilityDTO(
                facility.getId(),
                facility.getName(),
                facility.getLocation(),
                facility.getCapacity());
    }

    @Override
    public void deleteFacility(Long id) {
        facilityRepository.deleteById(id);
    }

    @Override
    public FacilityDTO updateFacility(Long id, FacilityDTO dto) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        facility.setName(dto.getName());
        facility.setLocation(dto.getLocation());
        facility.setCapacity(dto.getCapacity());

        Facility updated = facilityRepository.save(facility);

        return new FacilityDTO(
                updated.getId(),
                updated.getName(),
                updated.getLocation(),
                updated.getCapacity()
        );
    }
}
