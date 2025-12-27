package sk.ytr.modules.dto.response;

import jakarta.persistence.Entity;
import lombok.*;
import sk.ytr.modules.entity.MedicalIndicator;

/**
 * Response chỉ tiêu khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalIndicatorResponseDTO {

    /** ID chỉ tiêu */
    private Long id;

    /** Mã chỉ tiêu */
    private String indicatorCode;

    /** Tên chỉ tiêu */
    private String indicatorName;

    /** Có chỉ tiêu con */
    private Boolean hasSubIndicator;

    /** Thứ tự hiển thị */
    private Integer displayOrder;

    /** Trạng thái */
    private Boolean isActive;

    public static MedicalIndicatorResponseDTO fromEntity(MedicalIndicator entity) {
        return MedicalIndicatorResponseDTO.builder()
                .id(entity.getId())
                .indicatorCode(entity.getIndicatorCode())
                .indicatorName(entity.getIndicatorName())
                .hasSubIndicator(entity.getHasSubIndicator())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
