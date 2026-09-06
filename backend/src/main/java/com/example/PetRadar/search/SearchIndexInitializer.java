package com.example.PetRadar.search;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 인덱스가 비어 있으면 DB 내용으로 채운다.
 * 볼륨을 지웠거나 처음 배포한 경우가 여기 해당한다.
 * 장애로 일부만 누락된 경우는 인덱스가 비어있지 않아 걸리지 않으므로
 * /api/internal/search/reindex 로 직접 돌려야 한다.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SearchIndexInitializer {

    private final MissingSearchService searchService;

    @Bean
    public ApplicationRunner indexExistingMissingReports() {
        return args -> {
            try {
                if (searchService.indexedCount() == 0) {
                    searchService.reindexAll();
                }
            } catch (Exception e) {
                // 색인 초기화가 실패해도 애플리케이션은 떠야 한다
                log.error("검색 인덱스 초기화 실패 (재색인 필요)", e);
            }
        };
    }
}
