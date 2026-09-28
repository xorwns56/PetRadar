package com.example.PetRadar.shelter;

import lombok.Builder;
import lombok.Getter;

/**
 * 동물보호센터 한 곳.
 *
 * 공공데이터포털 "동물보호센터 정보조회 서비스"(shelterInfo)에서 받는다.
 * 좌표(lat/lng)는 이 API에만 있다 — 구조동물 API는 보호소 주소만 주고
 * 좌표를 주지 않아서, 지도에 찍으려면 반드시 이쪽을 함께 써야 한다.
 */
@Getter
@Builder
public class ShelterDTO {
    /** 두 공공 API를 잇는 키 */
    private final String careRegNo;
    private final String name;
    private final String tel;
    private final String address;

    /** 좌표가 없는 센터가 소수 있다. 그때는 지도에 찍지 않고 목록에만 남긴다 */
    private final Double lat;
    private final Double lng;

    /** 관할 지자체 ("경기도 화성시") */
    private final String orgNm;
    /** "개+고양이+기타" 형태 */
    private final String saveTargetAnimal;

    private final String openTime;
    private final String closeTime;
    private final String closeDay;

    /** 지금 보호 중인 마릿수. 구조동물 API를 careRegNo로 묶어 센다 */
    private final int animalCount;

    /** 조회 위치가 주어졌을 때만 채운다 (km) */
    private final Double distanceKm;
}
