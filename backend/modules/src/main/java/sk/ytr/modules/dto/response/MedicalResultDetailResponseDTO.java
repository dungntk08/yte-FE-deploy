package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.MedicalResultDetail;

/**
 * Response kết quả khám của học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalResultDetailResponseDTO {

    /** ID kết quả */
    private Long id;

    /** ID học sinh */
    private Long studentId;

    /** Cấu hình chỉ tiêu khám */
    private CampaignMedicalConfigResponseDTO campaignMedicalConfig;

    /** Giá trị kết quả */
    private Object resultValue;

    public static MedicalResultDetailResponseDTO fromEntity(MedicalResultDetail entity) {
        return MedicalResultDetailResponseDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent().getId())
                .campaignMedicalConfig(CampaignMedicalConfigResponseDTO.fromEntity(entity.getCampaignMedicalConfig()))
                .resultValue(entity.getResultValue())
                .build();
    }
}