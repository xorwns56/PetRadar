package com.example.PetRadar.search;

import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingDTO;
import com.example.PetRadar.missing.MissingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissingSearchService {

    private final MissingSearchRepository searchRepository;
    private final MissingRepository missingRepository;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    /**
     * 색인/삭제는 글 등록·수정·삭제에서 호출된다.
     * Elasticsearch는 DB 트랜잭션에 참여하지 않으므로 실패해도 예외를 퍼뜨리지 않는다.
     * 검색에서 잠깐 빠지더라도 글 자체는 등록되는 편이 낫고, 누락분은 재색인으로 복구한다.
     *
     * 검색은 MySQL로 옮겼지만 색인은 아직 남겨 둔다 — 되돌릴 수 있게 하기 위해서다.
     */
    public void index(Missing missing) {
        try {
            searchRepository.save(MissingDocument.from(missing));
        } catch (Exception e) {
            log.error("실종 신고 색인 실패 (재색인 필요): missingId={}", missing.getId(), e);
        }
    }

    public void delete(Long missingId) {
        try {
            searchRepository.deleteById(missingId);
        } catch (Exception e) {
            log.error("실종 신고 색인 삭제 실패: missingId={}", missingId, e);
        }
    }

    /**
     * 전문 검색: 제목, 내용, 이름, 품종, 실종장소를 한 번에 훑는다.
     *
     * MySQL FULLTEXT(ngram)로 옮겼다. 예전에는 Elasticsearch를 썼는데 인덱스에
     * 분석기 설정이 없어 기본 standard 분석기가 쓰였고, 한국어에서는 공백으로만
     * 자르는 탓에 조사가 붙은 채 한 덩어리가 됐다 — "구로"로 검색해도
     * "서울 구로구"가 걸리지 않았다.
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

    /**
     * DB에 있는 글 전체를 다시 색인한다.
     * 인덱스가 비어 있을 때(볼륨 삭제, 첫 배포)와 장애로 누락된 글을 복구할 때 쓴다.
     */
    public long reindexAll() {
        List<Missing> all = missingRepository.findAllWithUser();
        searchRepository.saveAll(all.stream().map(MissingDocument::from).toList());
        log.info("전체 재색인 완료: {}건", all.size());
        return all.size();
    }

    public long indexedCount() {
        return searchRepository.count();
    }
}
