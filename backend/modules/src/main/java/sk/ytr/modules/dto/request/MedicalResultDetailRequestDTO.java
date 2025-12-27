package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;
import sk.ytr.modules.entity.CampaignMedicalConfig;
import sk.ytr.modules.entity.MedicalResultDetail;
import sk.ytr.modules.entity.Student;

/**
 * Request lưu kết quả khám cho học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalResultDetailRequestDTO {

    /**
     * ID học sinh
     */
    private Long studentId;

    /**
     * ID cấu hình chỉ tiêu khám
     */
    private Long campaignMedicalConfigId;

    /**
     * Giá trị kết quả (true/false hoặc chi tiết JSON)
     */
    private Object resultValue;

    /**
     * Convert RequestDTO → Entity
     */
    public MedicalResultDetail toEntity(
            Student student,
            CampaignMedicalConfig config
    ) {
        return MedicalResultDetail.builder()
                .student(student)
                .campaignMedicalConfig(config)
                .resultValue(convertResultValue())
                .build();
    }

    /**
     * Chuẩn hóa dữ liệu resultValue
     */
    private Boolean convertResultValue() {
        if (resultValue == null) {
            return null;
        }

        if (resultValue instanceof Boolean) {
            return (Boolean) resultValue;
        }

        if (resultValue instanceof String) {
            return Boolean.parseBoolean((String) resultValue);
        }

        throw new IllegalArgumentException("Giá trị kết quả khám không hợp lệ");
    }
}
