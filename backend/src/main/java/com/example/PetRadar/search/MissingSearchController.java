package com.example.PetRadar.search;

import com.example.PetRadar.missing.MissingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class MissingSearchController {

    private final MissingSearchService searchService;

    // 전문 검색. 목록 API와 같은 형태로 응답한다
    @GetMapping
    public ResponseEntity<List<MissingDTO>> search(@RequestParam(defaultValue = "") String searchInput) {
        return ResponseEntity.ok(searchService.search(searchInput));
    }
}
