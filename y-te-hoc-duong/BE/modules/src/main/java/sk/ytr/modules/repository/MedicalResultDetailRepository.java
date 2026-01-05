package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.entity.MedicalResultDetail;

import java.util.List;
import java.util.Optional;

public interface MedicalResultDetailRepository extends JpaRepository<MedicalResultDetail, Long> {
    List<MedicalResultDetail> findByStudentId(Long studentId);
    Optional<MedicalResultDetail> findByStudentIdAndCampaignIdAndMedicalGroupIdAndMedicalIndicatorIdAndMedicalSubIndicatorId(
            Long studentId,
            Long campaignId,
            Long medicalGroupId,
            Long medicalIndicatorId,
            Long medicalSubIndicatorId
    );

    List<MedicalResultDetail> findByStudentIdAndCampaignId(Long id, Long campaignId);

    @Query("""
       SELECT m
       FROM MedicalResultDetail m
       WHERE m.campaign.id = :campaignId
       """)
    List<MedicalResultDetail> findByCampaignId(@Param("campaignId") Long campaignId);

}