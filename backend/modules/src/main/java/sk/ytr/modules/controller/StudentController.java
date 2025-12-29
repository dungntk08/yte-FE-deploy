package sk.ytr.modules.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.service.StudentService;

import java.util.List;
@RestController
@RequestMapping("/api/students")
@CrossOrigin
@Slf4j
public class StudentController {

    private StudentService service;

    @PostMapping
    public StudentResponseDTO create(
            @RequestBody StudentRequestDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public StudentResponseDTO update(
            @PathVariable Long id,
            @RequestBody StudentRequestDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public StudentResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/campaign/{campaignId}")
    public List<StudentResponseDTO> getByCampaignId(
            @PathVariable Long campaignId) {
        return service.getByCampaignId(campaignId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
