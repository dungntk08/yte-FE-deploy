package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "medical_campaign_school",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_mcs_campaign_school",
                        columnNames = {"medical_campaign_id", "school_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCampaignSchool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "medical_campaign_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_mcs_medical_campaign")
    )
    private MedicalCampaign medicalCampaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "school_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_mcs_school")
    )
    private School school;
}
