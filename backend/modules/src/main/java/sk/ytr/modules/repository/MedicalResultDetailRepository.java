package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.entity.MedicalResultDetail;

import java.util.List;

public interface MedicalResultDetailRepository extends JpaRepository<MedicalResultDetail, Long> {
    List<MedicalResultDetail> findByStudentId(Long studentId);
}