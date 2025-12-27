package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalGroupRequestDTO;
import sk.ytr.modules.dto.response.MedicalGroupResponseDTO;

import java.util.List;

public interface MedicalGroupService {

    MedicalGroupResponseDTO create(MedicalGroupRequestDTO request);

    MedicalGroupResponseDTO update(Long id, MedicalGroupRequestDTO request);

    List<MedicalGroupResponseDTO> getAll();

    void delete(Long id);
}
