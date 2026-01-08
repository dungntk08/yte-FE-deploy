package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.SchoolClass;

import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findBySchoolId(Long schoolId);
    Optional<SchoolClass> findByClassNameAndSchoolId(String className, Long schoolId);
}
