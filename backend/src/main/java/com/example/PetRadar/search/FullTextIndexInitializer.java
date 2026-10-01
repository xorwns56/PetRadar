package com.example.PetRadar.search;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 전문검색용 FULLTEXT 인덱스를 기동 시 확인하고 없으면 만든다.
 *
 * ddl-auto=update는 이 인덱스를 만들어 주지 않는다 — Hibernate가 파서를 지정한
 * FULLTEXT 인덱스를 다루지 못한다. 그렇다고 배포할 때 손으로 실행하게 두면,
 * 한 번 빠뜨리는 순간 검색이 통째로 500이 된다(ERROR 1191). 이 저장소에는
 * 마이그레이션 도구가 없으므로 기동 시 맞추는 쪽이 안전하다.
 *
 * 같은 SQL이 resources/db/fulltext-index.sql 에도 있다. 그쪽은 손으로 확인하거나
 * 다시 만들 때 쓴다.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FullTextIndexInitializer {

    /**
     * 인덱스 이름 → 만드는 SQL.
     *
     * 넷인 이유는 칼럼별 가중치 때문이다. 하나의 FULLTEXT 인덱스 안에서는 칼럼마다
     * 다른 가중치를 줄 수 없어, 점수를 매길 칼럼은 각자 인덱스를 가져야 한다.
     * ft_missing_all은 WHERE 절에서 후보를 추리는 용도다.
     */
    private static final Map<String, String> INDEXES = new LinkedHashMap<>(Map.of(
            "ft_missing_all",
            "alter table missing add fulltext index ft_missing_all "
                    + "(title, content, pet_name, pet_breed, pet_missing_place) with parser ngram",
            "ft_missing_breed",
            "alter table missing add fulltext index ft_missing_breed (pet_breed) with parser ngram",
            "ft_missing_title",
            "alter table missing add fulltext index ft_missing_title (title) with parser ngram",
            "ft_missing_place",
            "alter table missing add fulltext index ft_missing_place (pet_missing_place) with parser ngram"
    ));

    private static final String EXISTS_QUERY = """
            select count(*) from information_schema.statistics
            where table_schema = database() and table_name = 'missing' and index_name = ?
            """;

    private final JdbcTemplate jdbcTemplate;

    @Bean
    public ApplicationRunner createFullTextIndexes() {
        return args -> INDEXES.forEach(this::createIfAbsent);
    }

    private void createIfAbsent(String name, String ddl) {
        try {
            Integer found = jdbcTemplate.queryForObject(EXISTS_QUERY, Integer.class, name);
            if (found != null && found > 0) {
                return;
            }
            // InnoDB는 한 번에 하나씩만 만든다. 그래서 묶지 않고 하나씩 돈다
            jdbcTemplate.execute(ddl);
            log.info("전문검색 인덱스 생성: {}", name);
        } catch (Exception e) {
            // 인덱스를 못 만들어도 앱은 떠야 한다. 검색만 실패하고 나머지는 동작한다
            log.error("전문검색 인덱스 생성 실패: {} — 검색이 동작하지 않는다. "
                    + "resources/db/fulltext-index.sql 을 직접 실행할 것", name, e);
        }
    }
}
