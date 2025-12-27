package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;

import java.util.List;

public interface StudentService {

    StudentResponseDTO create(StudentRequestDTO request);

    StudentResponseDTO update(Long id, StudentRequestDTO request);

    StudentResponseDTO getById(Long id);

    void delete(Long id);

    List<StudentResponseDTO> getByCampaignId(Long campaignId);
}
