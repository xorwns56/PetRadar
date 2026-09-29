/* 신고 폼의 품종 선택지.

   공공데이터포털 품종 코드표(개 206종)를 그대로 쓰지 않고 큰 분류만 둔다.
   세부 품종까지 늘어놓으면 고르기가 더 어려운데, 매칭은 양방향 부분 일치라
   "푸들"로 신고해도 보호소의 "토이 푸들"·"미니어쳐 푸들"과 맞기 때문이다.

   목록은 실제 보호 중인 동물의 품종 분포로 정했다.
   이 22 + 16개로 개 97.9%, 고양이 99.4%를 덮는다. 나머지는 "기타"로 받는다. */

export const dogBreed = [
  // 보호소 등록의 84%가 믹스견이라 맨 위에 둔다
  { dogTypeNum: 1, dogType: "믹스견" },
  { dogTypeNum: 2, dogType: "말티즈" },
  { dogTypeNum: 3, dogType: "푸들" },
  { dogTypeNum: 4, dogType: "포메라니안" },
  { dogTypeNum: 5, dogType: "시츄" },
  { dogTypeNum: 6, dogType: "치와와" },
  { dogTypeNum: 7, dogType: "요크셔 테리어" },
  { dogTypeNum: 8, dogType: "닥스훈트" },
  { dogTypeNum: 9, dogType: "진도견" },
  { dogTypeNum: 10, dogType: "비숑 프리제" },
  { dogTypeNum: 11, dogType: "스피츠" },
  { dogTypeNum: 12, dogType: "시바" },
  { dogTypeNum: 13, dogType: "웰시 코기" },
  { dogTypeNum: 14, dogType: "리트리버" },
  { dogTypeNum: 15, dogType: "보더 콜리" },
  { dogTypeNum: 16, dogType: "비글" },
  { dogTypeNum: 17, dogType: "슈나우저" },
  { dogTypeNum: 18, dogType: "불독" },
  { dogTypeNum: 19, dogType: "허스키" },
  { dogTypeNum: 20, dogType: "사모예드" },
  { dogTypeNum: 21, dogType: "셰퍼드" },
  { dogTypeNum: 22, dogType: "기타" },
];

export const catBreed = [
  /* 보호소는 "한국 고양이"로 등록한다(고양이의 80%).
     예전 목록에는 "코리안 숏헤어"만 있어서, 서로를 포함하지 않는 문자열이라
     고양이 실종 신고가 전부 품종 불일치로 처리됐다 */
  { catTypeNum: 1, catType: "한국 고양이" },
  { catTypeNum: 2, catType: "믹스묘" },
  { catTypeNum: 3, catType: "러시안 블루" },
  { catTypeNum: 4, catType: "먼치킨" },
  { catTypeNum: 5, catType: "페르시안" },
  { catTypeNum: 6, catType: "샴" },
  { catTypeNum: 7, catType: "벵갈" },
  { catTypeNum: 8, catType: "스코티시폴드" },
  { catTypeNum: 9, catType: "노르웨이 숲" },
  { catTypeNum: 10, catType: "메인쿤" },
  { catTypeNum: 11, catType: "아메리칸 쇼트헤어" },
  { catTypeNum: 12, catType: "브리티시 쇼트헤어" },
  { catTypeNum: 13, catType: "터키시 앙고라" },
  { catTypeNum: 14, catType: "레그돌" },
  { catTypeNum: 15, catType: "스핑크스" },
  { catTypeNum: 16, catType: "기타" },
];

/* 공공 데이터는 개·고양이 외를 "기타축종" 하나로만 구분한다.
   그래서 아래 값은 매칭에 쓰이지 않고 화면 표시용이다 */
export const etcBreed = [
  { etcTypeNum: 1, etcType: "햄스터" },
  { etcTypeNum: 2, etcType: "토끼" },
  { etcTypeNum: 3, etcType: "파충류" },
  { etcTypeNum: 4, etcType: "조류" },
  { etcTypeNum: 5, etcType: "기타" },
];
