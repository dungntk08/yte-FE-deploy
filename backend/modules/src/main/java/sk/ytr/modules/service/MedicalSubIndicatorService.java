package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;

import java.util.List;

public interface MedicalSubIndicatorService {

    MedicalSubIndicatorResponseDTO create(MedicalSubIndicatorRequestDTO request);

    MedicalSubIndicatorResponseDTO update(Long id, MedicalSubIndicatorRequestDTO request);

    MedicalSubIndicatorResponseDTO getById(Long id);

    void delete(Long id);

    List<MedicalSubIndicatorResponseDTO> getByIndicatorId(Long indicatorId);
}
