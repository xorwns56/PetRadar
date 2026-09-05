package com.example.PetRadar.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

// Spring Data Elasticsearch 레포지토리 (JpaRepository와 같은 패턴)
public interface MissingSearchRepository extends ElasticsearchRepository<MissingDocument, Long> {
}
