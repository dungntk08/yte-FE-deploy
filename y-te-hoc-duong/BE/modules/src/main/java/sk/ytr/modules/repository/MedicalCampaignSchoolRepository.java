package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.MedicalCampaignSchool;
import sk.ytr.modules.entity.MedicalGroup;

public interface MedicalCampaignSchoolRepository extends JpaRepository<MedicalCampaignSchool, Long> {
}
