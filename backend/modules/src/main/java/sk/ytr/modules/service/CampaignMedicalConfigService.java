package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.CampaignMedicalConfigRequestDTO;
import sk.ytr.modules.dto.response.CampaignMedicalConfigResponseDTO;

import java.util.List;

public interface CampaignMedicalConfigService {
    CampaignMedicalConfigResponseDTO create(CampaignMedicalConfigRequestDTO request);

    CampaignMedicalConfigResponseDTO update(Long id, CampaignMedicalConfigRequestDTO request);

    CampaignMedicalConfigResponseDTO getById(Long id);

    void delete(Long id);

    List<CampaignMedicalConfigResponseDTO> getByCampaignId(Long campaignId);
}
