package com.example.PetRadar.shelter;

import lombok.Builder;
import lombok.Getter;

/**
 * 보호 중인 유기동물 한 마리.
 *
 * 공공데이터포털 "구조동물 조회 서비스"(abandonmentPublic)의 응답을 화면이
 * 쓰기 좋은 이름으로 추린 것이다. 원본은 필드가 30개에 이름도 제각각이라
 * (popfile1, upKindNm, colorCd…) 그대로 내려보내면 프론트가 공공 API의
 * 사정을 알아야 한다.
 *
 * 발견 좌표는 없다. happenPlace가 "초계면소방서", "보호센터 내 출산"처럼
 * 자유 문자열이라 좌표로 바꿀 수 없어, 위치는 orgNm(관할 지자체)으로만 다룬다.
 */
@Getter
@Builder
public class ShelterAnimalDTO {
    /** 유기번호. 공공 API 전체에서 고유하다 */
    private final String desertionNo;

    /** 개 / 고양이 / 기타 */
    private final String kindType;
    /** 품종. 절반 이상이 "믹스견"·"한국 고양이"라 매칭 조건으로 쓰면 안 된다 */
    private final String breed;
    private final String color;
    /** "2023(년생)" 형태로 온다 */
    private final String age;
    private final String weight;
    /** M / F / Q(미상) */
    private final String sex;
    /** Y / N / U(미상) */
    private final String neutered;
    private final String specialMark;

    /** 발견일 (yyyyMMdd) */
    private final String foundDate;
    /** 발견장소. 표기가 제각각이라 보여주기 용도로만 쓴다 */
    private final String foundPlace;
    /** 관할 지자체 ("경기도 화성시"). 사실상의 발견 지역이다 */
    private final String orgNm;

    /** 공고 기간 (yyyyMMdd) */
    private final String noticeStartDate;
    private final String noticeEndDate;
    /** 보호중 / 종료(입양) 등 */
    private final String state;

    /** 원본이 http로 오므로 https로 바꿔 담는다 (배포가 HTTPS라 그대로 두면 차단된다) */
    private final String imageUrl;
    private final String thumbnailUrl;

    /** 어느 보호소에 있는지 */
    private final String careRegNo;
    private final String careName;
    private final String careTel;
    private final String careAddress;
}
