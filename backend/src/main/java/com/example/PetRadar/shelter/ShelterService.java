package com.example.PetRadar.shelter;

import com.example.PetRadar.global.error.NotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 공공 API 두 곳을 합쳐 화면이 쓸 형태로 만든다.
 *
 * 매 요청마다 부르면 전국 7천 건을 8번에 걸쳐 받게 되므로 결과를 캐시한다.
 * 캐시 스타터를 따로 들이지 않고 참조 하나로 둔다 — 갱신 단위가 "전체"라
 * 키별 만료가 필요 없고, 이 저장소에 아직 캐시 의존성이 없다.
 *
 * TTL이 1시간인 이유: 공공 API는 하루 한 번이 아니라 종일 갱신된다
 * (확인 시점에 당일 등록분이 200건 넘게 들어와 있었다). 하루로 잡으면
 * 아침에 들어온 아이를 저녁까지 못 본다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShelterService {

    /** 공공 API가 "아직 보호 중"으로 표시하는 값. 종료된 개체는 화면에 내지 않는다 */
    private static final String STATE_PROTECTING = "보호중";

    private final PublicAnimalApiClient apiClient;

    @Value("${app.shelter.cache-ttl-minutes:60}")
    private long cacheTtlMinutes;

    private final AtomicReference<Snapshot> cache = new AtomicReference<>();

    /** 한 번에 받아둔 전체. 부분 갱신을 하지 않으므로 통째로 교체한다 */
    private record Snapshot(List<ShelterDTO> shelters,
                            List<ShelterAnimalDTO> animals,
                            Instant loadedAt) {
    }

    /**
     * 보호소 목록.
     * 좌표가 주어지면 가까운 순, 아니면 보호 중인 마릿수가 많은 순으로 준다.
     */
    public List<ShelterDTO> getShelters(Double lat, Double lng) {
        List<ShelterDTO> shelters = snapshot().shelters();
        if (lat == null || lng == null) {
            return shelters.stream()
                    .sorted(Comparator.comparingInt(ShelterDTO::getAnimalCount).reversed())
                    .toList();
        }
        // 좌표가 없는 센터는 거리를 잴 수 없어 뒤로 보낸다
        return shelters.stream()
                .map(s -> withDistance(s, lat, lng))
                .sorted(Comparator.comparing(
                        ShelterDTO::getDistanceKm,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    /** 보호 중인 동물 전체. 실종 신고와 맞춰 보는 쪽이 직접 거른다 */
    public List<ShelterAnimalDTO> getAllAnimals() {
        return snapshot().animals();
    }

    /** 한 보호소가 지금 보호 중인 동물 */
    public List<ShelterAnimalDTO> getAnimalsByShelter(String careRegNo) {
        List<ShelterAnimalDTO> animals = snapshot().animals().stream()
                .filter(a -> careRegNo.equals(a.getCareRegNo()))
                .toList();
        if (animals.isEmpty() && findShelter(careRegNo).isEmpty()) {
            throw new NotFoundException("보호소를 찾을 수 없습니다.");
        }
        return animals;
    }

    /**
     * 지역 기준 보호 동물.
     *
     * 발견 지점의 좌표가 없어 거리로는 좁힐 수 없다. 대신 orgNm(관할 지자체)이
     * 모든 레코드에 채워져 있고, 유기동물은 발견된 지자체 관할로 접수되므로
     * 이것이 사실상 "발견 지역"이다.
     *
     * 시군구까지 맞는 게 없으면 시도로 넓힌다 — 작은 지자체는 보호 중인 개체가
     * 아예 없는 날이 있어, 그대로 빈 화면을 내면 고장난 것처럼 보인다.
     */
    public List<ShelterAnimalDTO> getAnimalsByRegion(String region, int limit) {
        List<ShelterAnimalDTO> animals = snapshot().animals();
        if (region == null || region.isBlank()) return latest(animals, limit);

        List<ShelterAnimalDTO> exact = animals.stream()
                .filter(a -> region.equals(a.getOrgNm()))
                .toList();
        if (!exact.isEmpty()) return latest(exact, limit);

        String sido = region.split(" ")[0];
        List<ShelterAnimalDTO> inSido = animals.stream()
                .filter(a -> a.getOrgNm() != null && a.getOrgNm().startsWith(sido))
                .toList();
        return latest(inSido.isEmpty() ? animals : inSido, limit);
    }

    private List<ShelterAnimalDTO> latest(List<ShelterAnimalDTO> animals, int limit) {
        return animals.stream()
                .sorted(Comparator.comparing(
                        ShelterAnimalDTO::getFoundDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .toList();
    }

    private Optional<ShelterDTO> findShelter(String careRegNo) {
        return snapshot().shelters().stream()
                .filter(s -> careRegNo.equals(s.getCareRegNo()))
                .findFirst();
    }

    private ShelterDTO withDistance(ShelterDTO s, double lat, double lng) {
        Double d = (s.getLat() == null || s.getLng() == null)
                ? null : distanceKm(lat, lng, s.getLat(), s.getLng());
        return ShelterDTO.builder()
                .careRegNo(s.getCareRegNo()).name(s.getName()).tel(s.getTel())
                .address(s.getAddress()).lat(s.getLat()).lng(s.getLng())
                .orgNm(s.getOrgNm()).saveTargetAnimal(s.getSaveTargetAnimal())
                .openTime(s.getOpenTime()).closeTime(s.getCloseTime()).closeDay(s.getCloseDay())
                .animalCount(s.getAnimalCount())
                .distanceKm(d)
                .build();
    }

    /** 하버사인. 보호소 목록을 가까운 순으로 정렬하는 용도라 이 정도 정밀도면 충분하다 */
    private double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return Math.round(r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10.0;
    }

    private Snapshot snapshot() {
        Snapshot current = cache.get();
        if (current != null && !isExpired(current)) return current;

        synchronized (this) {
            // 기다리는 동안 다른 요청이 채웠을 수 있다
            Snapshot latest = cache.get();
            if (latest != null && !isExpired(latest)) return latest;
            try {
                Snapshot loaded = load();
                cache.set(loaded);
                return loaded;
            } catch (Exception e) {
                // 갱신에 실패했는데 예전 것이 남아 있으면 그걸 쓴다.
                // 공공 API가 잠깐 죽었다고 화면까지 비우는 편이 더 나쁘다
                if (latest != null) {
                    log.warn("보호소 갱신 실패, 이전 데이터를 유지한다", e);
                    return latest;
                }
                throw e;
            }
        }
    }

    private boolean isExpired(Snapshot s) {
        return Duration.between(s.loadedAt(), Instant.now()).toMinutes() >= cacheTtlMinutes;
    }

    private Snapshot load() {
        if (!apiClient.isConfigured()) {
            throw new IllegalStateException(
                    "공공데이터포털 인증키가 없습니다. DATA_GO_KR_SERVICE_KEY를 설정해주세요.");
        }

        List<ShelterAnimalDTO> animals = apiClient.fetchAllAnimals().stream()
                .filter(n -> STATE_PROTECTING.equals(n.path("processState").asText()))
                .map(ShelterMapper::toAnimal)
                .toList();

        Map<String, Integer> counts = new LinkedHashMap<>();
        animals.forEach(a -> counts.merge(a.getCareRegNo(), 1, Integer::sum));

        // 보호 중인 동물이 없는 센터는 목록에 두지 않는다.
        // 전국 339곳 중 절반 가까이가 지금 보호 중인 개체가 없어, 다 내보내면
        // "보호소 정보" 화면이 빈 보호소로 채워진다
        List<ShelterDTO> shelters = apiClient.fetchAllCenters().stream()
                .map(n -> ShelterMapper.toShelter(n, counts.getOrDefault(
                        n.path("careRegNo").asText(), 0)))
                .filter(s -> s.getAnimalCount() > 0)
                .toList();

        log.info("보호소 {}곳 / 보호 중인 동물 {}마리 적재", shelters.size(), animals.size());
        return new Snapshot(shelters, animals, Instant.now());
    }
}
