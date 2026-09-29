package com.example.PetRadar.missing;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/missing")
public class MissingController {
    private final MissingService missingService;

    @GetMapping
    public ResponseEntity<Page<MissingDTO>> getMissingList(
            @RequestParam(defaultValue = "") String searchInput,
            @RequestParam(defaultValue = "latest") String sortType,
            @PageableDefault(size = 12) Pageable pageable) {
        Sort sort = "oldest".equals(sortType)
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable paged = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return ResponseEntity.ok(missingService.getMissingList(searchInput, paged));
    }

    /**
     * 지도용 전체 목록.
     *
     * 목록 화면은 페이지로 끊어 받지만 지도는 그럴 수 없다. 지도는 화면에
     * 들어오는 것을 스스로 골라 그리므로, 페이지로 자르면 마커가 임의로 빠진다.
     */
    @GetMapping("/points")
    public ResponseEntity<List<MissingDTO>> getMissingPoints() {
        return ResponseEntity.ok(missingService.getMissingPoints());
    }

    @GetMapping("/me")
    public ResponseEntity<List<MissingDTO>> getMissingList(@AuthenticationPrincipal UserDetails userDetails, @SortDefault(sort = "createdAt", direction = Sort.Direction.DESC) Sort sort) {
        List<MissingDTO> missingList = missingService.getMissingList(Long.parseLong(userDetails.getUsername()), sort);
        return ResponseEntity.ok(missingList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissingDTO> getMissingDetail(@PathVariable Long id) {
        MissingDTO detail = missingService.getMissingDetail(id);
        return ResponseEntity.ok(detail);
    }

    // 이미지를 파일로 받으므로 multipart로 처리한다 (missing: JSON 파트, image: 파일 파트)
    @PostMapping
    public ResponseEntity<Void> createMissing(@Valid @RequestPart MissingRequest missing,
                                              @RequestPart(required = false) MultipartFile image,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        missingService.createMissing(Long.parseLong(userDetails.getUsername()), missing, image);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateMissing(@PathVariable Long id,
                                              @Valid @RequestPart MissingRequest missing,
                                              @RequestPart(required = false) MultipartFile image,
                                              @AuthenticationPrincipal UserDetails userDetails){
        missingService.updateMissing(id, missing, Long.parseLong(userDetails.getUsername()), image);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMissing(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        missingService.deleteMissing(id, Long.parseLong(userDetails.getUsername()));
        return ResponseEntity.ok().build();
    }

}
