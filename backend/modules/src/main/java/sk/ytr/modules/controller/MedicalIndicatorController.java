package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.service.MedicalIndicatorService;

import java.util.List;

@RestController
@RequestMapping("/api/medical-indicators")
@CrossOrigin
@Slf4j
public class MedicalIndicatorController {

    private MedicalIndicatorService service;

    @PostMapping
    public MedicalIndicatorResponseDTO create(
            @RequestBody MedicalIndicatorRequestDTO request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MedicalIndicatorResponseDTO update(
            @PathVariable Long id,
            @RequestBody MedicalIndicatorRequestDTO request) {
        return service.update(id, request);
    }

    @GetMapping("/group/{groupId}")
    public List<MedicalIndicatorResponseDTO> getByGroup(
            @PathVariable Long groupId) {
        return service.getByGroup(groupId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
