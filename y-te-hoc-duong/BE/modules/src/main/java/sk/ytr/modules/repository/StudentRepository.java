package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.entity.Student;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCampaignId(Long campaignId);

    boolean existsByCampaign_IdAndIdentityNumber(Long campaignId, String identityNumber);

    List<Student> findByCampaignIdOrderByFullNameAsc(Long campaignId);

    @Query(
            value = """
        SELECT s.*
        FROM student s
        WHERE s.campaign_id = :campaignId
          AND (
                :keyword IS NULL
                OR TRIM(:keyword) = ''
                OR LOWER(s.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(CAST(s.identity_number AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY s.class_name ASC, s.full_name ASC
        """,
            nativeQuery = true
    )
    List<Student> searchByCampaignAndKeyword(
            @Param("campaignId") Long campaignId,
            @Param("keyword") String keyword
    );



}