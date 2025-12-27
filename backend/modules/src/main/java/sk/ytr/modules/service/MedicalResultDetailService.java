package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;

import java.util.List;

public interface MedicalResultDetailService {

    MedicalResultDetailResponseDTO create(MedicalResultDetailRequestDTO request);

    MedicalResultDetailResponseDTO update(Long id, MedicalResultDetailRequestDTO request);

    MedicalResultDetailResponseDTO getById(Long id);

    void delete(Long id);

    List<MedicalResultDetailResponseDTO> getByStudentId(Long studentId);
}
