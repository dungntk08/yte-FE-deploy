package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.entity.CampaignMedicalConfig;

/**
 * Response cấu hình chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigResponseDTO {

    /** ID cấu hình */
    private Long id;

    /** Thông tin chỉ tiêu */
    private MedicalIndicatorResponseDTO indicator;

    /** Thông tin chỉ tiêu con */
    private MedicalSubIndicatorResponseDTO subIndicator;

    /** Bắt buộc nhập */
    private Boolean isRequired;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    public static CampaignMedicalConfigResponseDTO fromEntity(CampaignMedicalConfig entity) {
        return CampaignMedicalConfigResponseDTO.builder()
                .id(entity.getId())
                .indicator(MedicalIndicatorResponseDTO.fromEntity(entity.getSubIndicator().getIndicator()))
                .subIndicator(MedicalSubIndicatorResponseDTO.fromEntity(entity.getSubIndicator()))
                .isRequired(entity.getIsRequired())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
