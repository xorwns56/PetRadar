package com.example.PetRadar.shelter;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 보호소·보호동물 조회.
 *
 * 공공데이터포털 인증키를 서버에 두려고 프록시한다. 예전에는 브라우저가
 * 경기데이터드림을 직접 불렀는데, 키가 번들에 그대로 노출됐고 경기도
 * 데이터만 볼 수 있었다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shelter")
public class ShelterController {

    private final ShelterService shelterService;
    private final ShelterMatchService shelterMatchService;

    /** 보호소 목록. lat·lng를 주면 가까운 순으로 정렬한다 */
    @GetMapping
    public ResponseEntity<List<ShelterDTO>> getShelters(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(shelterService.getShelters(lat, lng));
    }

    /** 한 보호소가 보호 중인 동물 */
    @GetMapping("/{careRegNo}/animals")
    public ResponseEntity<List<ShelterAnimalDTO>> getAnimals(@PathVariable String careRegNo) {
        return ResponseEntity.ok(shelterService.getAnimalsByShelter(careRegNo));
    }

    /**
     * 한 실종 신고와 맞아 보이는 보호동물.
     *
     * region은 실종 지점의 관할 지자체다. 공공 API가 발견 지점의 좌표를 주지
     * 않아 거리로는 좁힐 수 없고, 좌표를 지역명으로 바꾸는 일은 카카오 SDK를
     * 쓸 수 있는 화면이 맡는다.
     */
    @GetMapping("/matches")
    public ResponseEntity<List<ShelterAnimalDTO>> getMatches(
            @RequestParam Long missingId,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(shelterMatchService.findCandidates(missingId, region));
    }

    /**
     * 지역 기준 보호동물. 홈 화면이 "우리 동네에 들어온 아이들"에 쓴다.
     * region은 "경기도 화성시"처럼 공공 API의 관할 지자체 표기를 그대로 받는다.
     */
    @GetMapping("/animals")
    public ResponseEntity<List<ShelterAnimalDTO>> getAnimalsByRegion(
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(shelterService.getAnimalsByRegion(region, limit));
    }
}
