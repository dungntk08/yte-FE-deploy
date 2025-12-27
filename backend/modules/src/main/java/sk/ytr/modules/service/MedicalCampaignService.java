package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.MedicalCampaignRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;

import java.util.List;

public interface MedicalCampaignService {

    MedicalCampaignResponseDTO create(MedicalCampaignRequestDTO request);

    MedicalCampaignResponseDTO update(Long id, MedicalCampaignRequestDTO request);

    MedicalCampaignResponseDTO getById(Long id);

    List<MedicalCampaignResponseDTO> getAll();

    void delete(Long id);
}

