package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;

/**
 * Request cấu hình chỉ tiêu khám cho đợt khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignMedicalConfigRequestDTO {

    /** ID đợt khám */
    private Long campaignId;

    /** ID chỉ tiêu */
    private Long indicatorId;

    /** ID chỉ tiêu con (nullable) */
    private Long subIndicatorId;

    /** Bắt buộc nhập hay không */
    private Boolean isRequired;

    /** Thứ tự hiển thị */
    private Integer displayOrder;
}
