package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.response.SchoolResponseDTO;
import sk.ytr.modules.repository.SchoolRepository;
import sk.ytr.modules.service.SchoolService;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;

    @Override
    public SchoolResponseDTO getById(Long id) {
        return schoolRepository.findById(id)
                .map(SchoolResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường học"));
    }

    @Override
    public List<SchoolResponseDTO> getAll() {
        return schoolRepository.findAll()
                .stream()
                .map(SchoolResponseDTO::fromEntity)
                .toList();
    }
}

