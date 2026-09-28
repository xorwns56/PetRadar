package com.example.PetRadar.shelter;

import com.fasterxml.jackson.databind.JsonNode;

/** 공공 API의 원본 JSON을 화면용 DTO로 옮긴다 */
final class ShelterMapper {

    private ShelterMapper() {
    }

    static ShelterAnimalDTO toAnimal(JsonNode n) {
        return ShelterAnimalDTO.builder()
                .desertionNo(text(n, "desertionNo"))
                .kindType(text(n, "upKindNm"))
                .breed(text(n, "kindNm"))
                .color(text(n, "colorCd"))
                .age(text(n, "age"))
                .weight(text(n, "weight"))
                .sex(text(n, "sexCd"))
                .neutered(text(n, "neuterYn"))
                .specialMark(text(n, "specialMark"))
                .foundDate(text(n, "happenDt"))
                .foundPlace(text(n, "happenPlace"))
                .orgNm(text(n, "orgNm"))
                .noticeStartDate(text(n, "noticeSdt"))
                .noticeEndDate(text(n, "noticeEdt"))
                .state(text(n, "processState"))
                .imageUrl(toHttps(text(n, "popfile1")))
                .thumbnailUrl(toHttps(text(n, "popfile2")))
                .careRegNo(text(n, "careRegNo"))
                .careName(text(n, "careNm"))
                .careTel(text(n, "careTel"))
                .careAddress(text(n, "careAddr"))
                .build();
    }

    static ShelterDTO toShelter(JsonNode n, int animalCount) {
        return ShelterDTO.builder()
                .careRegNo(text(n, "careRegNo"))
                .name(text(n, "careNm"))
                .tel(text(n, "careTel"))
                .address(text(n, "careAddr"))
                .lat(number(n, "lat"))
                .lng(number(n, "lng"))
                .orgNm(text(n, "orgNm"))
                .saveTargetAnimal(text(n, "saveTrgtAnimal"))
                .openTime(text(n, "weekOprStime"))
                .closeTime(text(n, "weekOprEtime"))
                .closeDay(text(n, "closeDay"))
                .animalCount(animalCount)
                .build();
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.path(field);
        if (v.isMissingNode() || v.isNull()) return null;
        String s = v.asText().trim();
        return s.isEmpty() ? null : s;
    }

    private static Double number(JsonNode n, String field) {
        String s = text(n, field);
        if (s == null) return null;
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return null;   // 좌표가 비어 있거나 형식이 깨진 센터가 소수 있다
        }
    }

    /**
     * 사진 주소가 http로 온다. 배포가 HTTPS라 그대로 내보내면 브라우저가
     * mixed content로 막아 사진이 하나도 안 보인다. 같은 호스트가 https도
     * 받으므로 스킴만 바꿔 준다.
     */
    private static String toHttps(String url) {
        if (url == null) return null;
        return url.startsWith("http://") ? "https://" + url.substring("http://".length()) : url;
    }
}
