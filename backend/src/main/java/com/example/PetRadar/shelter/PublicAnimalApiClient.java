package com.example.PetRadar.shelter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * 공공데이터포털 국가동물보호정보시스템 호출.
 *
 * 두 서비스를 함께 쓴다. 한쪽만으로는 화면을 만들 수 없다.
 *   - 구조동물 조회      : 보호 중인 동물. 보호소 주소는 주지만 좌표가 없다
 *   - 동물보호센터 정보조회 : 센터의 좌표. 대신 동물 정보가 없다
 * careRegNo가 두 응답을 잇는 키다.
 *
 * 응답의 items는 결과가 없을 때 객체가 아니라 빈 문자열로 오는 경우가 있어
 * 타입을 가정하지 않고 읽는다.
 */
@Slf4j
@Component
public class PublicAnimalApiClient {

    /** 한 번에 받을 수 있는 최대치. 이보다 크면 API가 INVALID REQUEST로 막는다 */
    private static final int ANIMAL_PAGE_SIZE = 1000;
    private static final int CENTER_PAGE_SIZE = 300;
    /** 응답의 totalCount가 실제보다 크게 오는 일이 있어(센터 860 vs 실제 339) 상한을 둔다 */
    private static final int MAX_PAGES = 20;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String serviceKey;
    private final String animalApiUrl;
    private final String centerApiUrl;

    public PublicAnimalApiClient(
            @Value("${app.shelter.service-key}") String serviceKey,
            @Value("${app.shelter.animal-api-url}") String animalApiUrl,
            @Value("${app.shelter.center-api-url}") String centerApiUrl) {
        this.serviceKey = serviceKey;
        this.animalApiUrl = animalApiUrl;
        this.centerApiUrl = centerApiUrl;
    }

    public boolean isConfigured() {
        return serviceKey != null && !serviceKey.isBlank();
    }

    /** 보호 중인 동물 전체 */
    public List<JsonNode> fetchAllAnimals() {
        return fetchAllPages(animalApiUrl, ANIMAL_PAGE_SIZE, "구조동물");
    }

    /** 동물보호센터 전체 */
    public List<JsonNode> fetchAllCenters() {
        return fetchAllPages(centerApiUrl, CENTER_PAGE_SIZE, "동물보호센터");
    }

    private List<JsonNode> fetchAllPages(String url, int pageSize, String label) {
        List<JsonNode> all = new ArrayList<>();
        for (int page = 1; page <= MAX_PAGES; page++) {
            List<JsonNode> rows = fetchPage(url, pageSize, page, label);
            all.addAll(rows);
            // totalCount를 믿지 않고 "덜 왔으면 끝"으로 판단한다
            if (rows.size() < pageSize) break;
        }
        log.info("{} {}건 수신", label, all.size());
        return all;
    }

    private List<JsonNode> fetchPage(String url, int pageSize, int page, String label) {
        URI uri = UriComponentsBuilder.fromUriString(url)
                .queryParam("serviceKey", serviceKey)
                .queryParam("_type", "json")
                .queryParam("numOfRows", pageSize)
                .queryParam("pageNo", page)
                .build(true)
                .toUri();

        String body = restClient.get().uri(uri).retrieve().body(String.class);
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (Exception e) {
            // 키가 틀리거나 서비스가 막히면 JSON이 아니라 HTML 오류 문서가 온다
            throw new IllegalStateException(label + " 응답을 해석할 수 없습니다", e);
        }

        JsonNode header = root.path("response").path("header");
        String code = header.path("resultCode").asText();
        if (!"00".equals(code)) {
            throw new IllegalStateException(
                    label + " 조회 실패: " + code + " " + header.path("resultMsg").asText());
        }

        JsonNode items = root.path("response").path("body").path("items");
        if (!items.isObject()) return List.of();   // 결과가 없으면 빈 문자열로 온다

        JsonNode item = items.path("item");
        List<JsonNode> rows = new ArrayList<>();
        if (item.isArray()) {
            item.forEach(rows::add);
        } else if (item.isObject()) {
            rows.add(item);                        // 1건이면 배열이 아니라 객체로 온다
        }
        return rows;
    }
}
