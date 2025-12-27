package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;

import java.util.List;

public interface MedicalIndicatorService {

    MedicalIndicatorResponseDTO create(MedicalIndicatorRequestDTO request);

    MedicalIndicatorResponseDTO update(Long id, MedicalIndicatorRequestDTO request);

    List<MedicalIndicatorResponseDTO> getByGroup(Long groupId);

    void delete(Long id);
}
