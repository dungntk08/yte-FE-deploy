package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sk.ytr.modules.dto.response.SchoolResponseDTO;
import sk.ytr.modules.service.SchoolService;

import java.util.List;
@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
@Slf4j
public class SchoolController {

    private final SchoolService service;

    @GetMapping("/{id}")
    public SchoolResponseDTO
    getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public List<SchoolResponseDTO> getAll() {
        return service.getAll();
    }
}

