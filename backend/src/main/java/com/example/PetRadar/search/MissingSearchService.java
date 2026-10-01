package com.example.PetRadar.search;

import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingDTO;
import com.example.PetRadar.missing.MissingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * 실종 글 전문 검색.
 *
 * 예전에는 Elasticsearch를 썼다. 인덱스에 분석기 설정이 없어 기본 standard
 * 분석기가 쓰였고, 한국어는 공백으로만 잘려 조사가 붙은 채 한 덩어리가 됐다 —
 * "구로"로 검색해도 "서울 구로구"가 걸리지 않았다.
 *
 * MySQL FULLTEXT의 ngram 파서가 같은 일(2글자 바이그램)을 컨테이너 없이 한다.
 * 저장소가 하나가 되면서 색인을 따로 관리할 필요도, 그것이 DB와 어긋날 일도 없어졌다.
 */
@Service
@RequiredArgsConstructor
public class MissingSearchService {

    private final MissingRepository missingRepository;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    /**
     * 전문 검색: 제목, 내용, 이름, 품종, 실종장소를 한 번에 훑는다.
     *
     * 세 단계다.
     *   1. 검색어를 교정한다 (별칭 사전 → 편집거리). 오타는 여기서 잡는다
     *   2. 교정된 말로 구문 일치 검색
     *   3. 그래도 0건이면 바이그램으로 넓힌다. 조각 하나만 겹쳐도 들어오므로
     *      노이즈가 섞인다 — 정확히 맞는 것이 있을 때는 쓰지 않는다
     */
    public Page<MissingDTO> search(String query, Pageable pageable) {
        // 네이티브 쿼리에 ORDER BY가 이미 있다. Pageable의 정렬을 함께 넘기면
        // Spring Data가 ORDER BY를 하나 더 붙여 SQL이 깨진다
        Pageable paged = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        String phrase = SearchTerms.phrase(query);
        if (phrase.isBlank()) {
            return Page.empty(paged);   // 한 글자 검색어 등
        }

        Page<Missing> hits = missingRepository.searchFullText(phrase, paged);
        if (hits.isEmpty()) {
            // 교정이 닿지 못한 오타를 받아내는 그물. 원문으로 넓힌다
            String bigrams = SearchTerms.bigrams(query);
            if (!bigrams.isBlank()) {
                hits = missingRepository.searchFullText(bigrams, paged);
            }
        }
        return hits.map(missing -> MissingDTO.from(missing, imageBaseUrl));
    }
}
