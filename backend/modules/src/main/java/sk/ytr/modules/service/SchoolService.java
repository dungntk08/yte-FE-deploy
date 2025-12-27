package sk.ytr.modules.service;

import sk.ytr.modules.dto.response.SchoolResponseDTO;

import java.util.List;

public interface SchoolService {

    SchoolResponseDTO getById(Long id);

    List<SchoolResponseDTO> getAll();
}
