package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.*;
/**
 * Cấu hình các chỉ tiêu khám áp dụng cho từng đợt khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "campaign_medical_config")
public class CampaignMedicalConfig {

    /** Khóa chính cấu hình */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Đợt khám */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private MedicalCampaign campaign;

    /** Chỉ tiêu khám */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id", nullable = false)
    private MedicalIndicator indicator;

    /** Chỉ tiêu con (nullable nếu không có) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_indicator_id")
    private MedicalSubIndicator subIndicator;

    /** Bắt buộc nhập hay không */
    @Column(name = "is_required")
    private Boolean isRequired;

    /** Thứ tự hiển thị */
    @Column(name = "display_order")
    private Integer displayOrder;
}
