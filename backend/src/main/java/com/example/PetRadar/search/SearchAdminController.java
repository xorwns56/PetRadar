package com.example.PetRadar.search;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 재색인 엔드포인트.
 * 색인 실패로 누락된 글을 복구할 때 쓴다.
 * /api/internal/ 경로는 nginx가 외부 요청을 막으므로 컨테이너 네트워크 안에서만 호출된다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/internal/search")
public class SearchAdminController {

    private final MissingSearchService searchService;

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Long>> reindex() {
        return ResponseEntity.ok(Map.of("indexed", searchService.reindexAll()));
    }
}
