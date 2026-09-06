package com.example.PetRadar.search;

import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import com.example.PetRadar.image.ImageUrls;
import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingDTO;
import com.example.PetRadar.missing.MissingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissingSearchService {

    private final MissingSearchRepository searchRepository;
    private final MissingRepository missingRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    /**
     * 색인/삭제는 글 등록·수정·삭제에서 호출된다.
     * Elasticsearch는 DB 트랜잭션에 참여하지 않으므로 실패해도 예외를 퍼뜨리지 않는다.
     * 검색에서 잠깐 빠지더라도 글 자체는 등록되는 편이 낫고, 누락분은 재색인으로 복구한다.
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

    // 전문 검색: 제목, 내용, 이름, 품종, 실종장소를 한 번에 훑는다
    public List<MissingDTO> search(String query) {
        NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(q -> q
                        .multiMatch(mm -> mm
                                .query(query)
                                .fields(
                                        "title^2",           // 제목 가중치 2배
                                        "content",
                                        "petName",           // 목격자는 이름을 모르므로 기본 가중치
                                        "petBreed^3",        // 품종 3배 (목격자의 주요 검색어)
                                        "petMissingPlace^2"  // 실종장소 2배 (목격 위치)
                                )
                                // most_fields: 여러 필드에 걸친 조합("말티즈 강남")도 점수를 합산해 위로 올린다
                                .type(TextQueryType.MostFields)
                                // 표기 흔들림 보정 (말티즈 ↔ 몰티즈)
                                .fuzziness("AUTO")
                        )
                )
                .build();

        SearchHits<MissingDocument> hits = elasticsearchOperations.search(searchQuery, MissingDocument.class);
        return hits.getSearchHits().stream()
                .map(hit -> toDTO(hit.getContent()))
                .toList();
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

    // 검색 결과를 목록 API와 같은 형태로 돌려주어 프론트가 그대로 쓸 수 있게 한다
    private MissingDTO toDTO(MissingDocument doc) {
        return new MissingDTO(
                doc.getId(),
                doc.getUserId(),
                doc.getPetName(),
                doc.getPetType(),
                doc.getPetGender(),
                doc.getPetBreed(),
                doc.getPetAge(),
                doc.getPetMissingDate(),
                doc.getPetMissingPlace(),
                null,   // 실종 위치 좌표는 검색 결과 카드에서 쓰지 않아 색인하지 않는다
                ImageUrls.of(doc.getPetImage(), imageBaseUrl),
                doc.getTitle(),
                doc.getContent()
        );
    }
}
