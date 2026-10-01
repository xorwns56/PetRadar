package com.example.PetRadar.missing;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissingRepository extends JpaRepository<Missing, Long> {
    List<Missing> findByTitleContainingIgnoreCase(String title, Sort sort);

    Page<Missing> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    @Query("SELECT m FROM Missing m JOIN FETCH m.user WHERE m.user.id = :userId")
    List<Missing> findByUserIdWithUser(Long userId, Sort sort);

    // 재색인용 - 문서에 userId가 필요해 user를 함께 가져온다
    @Query("SELECT m FROM Missing m JOIN FETCH m.user")
    List<Missing> findAllWithUser();

    /**
     * 전문 검색 (MySQL FULLTEXT, ngram 파서).
     *
     * ORDER BY의 식이 가중치다 — 품종 3배, 제목·실종장소 2배, 나머지 1배.
     * 하나의 FULLTEXT 인덱스로는 칼럼별 가중치를 줄 수 없어 칼럼마다 점수를 매겨
     * 더한다. 그래서 인덱스가 넷이다(FullTextIndexInitializer).
     *
     * 점수는 ORDER BY에만 쓰고 SELECT에는 넣지 않는다. 넣으면 Missing으로
     * 매핑되지 않는다.
     *
     * q는 boolean mode 문법이다. 사용자가 친 문자열을 그대로 넣으면 안 된다
     * (SearchTerms가 정제·교정해 만든다).
     */
    @Query(value = """
            select m.* from missing m
            where match(m.title, m.content, m.pet_name, m.pet_breed, m.pet_missing_place)
                  against (:q in boolean mode)
            order by 3 * match(m.pet_breed) against (:q in boolean mode)
                   + 2 * match(m.title) against (:q in boolean mode)
                   + 2 * match(m.pet_missing_place) against (:q in boolean mode)
                   + 1 * match(m.title, m.content, m.pet_name, m.pet_breed, m.pet_missing_place)
                         against (:q in boolean mode) desc,
                     m.created_at desc
            """,
            countQuery = """
            select count(*) from missing m
            where match(m.title, m.content, m.pet_name, m.pet_breed, m.pet_missing_place)
                  against (:q in boolean mode)
            """,
            nativeQuery = true)
    Page<Missing> searchFullText(@Param("q") String q, Pageable pageable);
}