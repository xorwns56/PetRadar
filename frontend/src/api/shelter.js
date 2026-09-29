import { client } from "./client";

/**
 * 보호소·보호동물 조회.
 *
 * 예전에는 브라우저가 경기데이터드림을 직접 불렀다. 인증키가 번들에 그대로
 * 노출됐고, 경기도 데이터만 볼 수 있었으며, 한 번에 100건만 받아 그 안에서
 * 화면이 잘라 쓰는 구조라 "보호소 목록"이 매번 달라졌다.
 *
 * 지금은 백엔드가 공공데이터포털(전국)을 대신 부른다. 키는 서버에만 있고,
 * 보호가 끝난 개체(입양·반환·폐사)는 서버에서 걸러져 내려온다.
 */

/** 보호 중인 동물이 있는 보호소. 좌표를 주면 가까운 순으로 온다 */
export const fetchShelters = ({ lat, lng } = {}) =>
  client
    .get("/api/shelter", { params: lat != null && lng != null ? { lat, lng } : {} })
    .then((r) => r.data);

/**
 * 한 보호소가 지금 보호 중인 동물 (페이지 단위).
 * 191마리인 보호소가 있어 서버가 끊어서 준다.
 * page는 0부터 센다(Spring). 정렬도 서버가 한다 — 한 쪽만 정렬하면
 * 전체 기준이 아니라 그 쪽 안에서만 순서가 바뀐다.
 */
export const fetchShelterAnimals = (careRegNo, { page = 0, size = 12, sortType = "newest" } = {}) =>
  client
    .get(`/api/shelter/${careRegNo}/animals`, { params: { page, size, sortType } })
    .then((r) => r.data);

/**
 * 지역 기준 보호동물 (홈 화면용).
 *
 * 발견 지점의 좌표는 공공 API에 없다. 대신 관할 지자체(orgNm)가 모든
 * 레코드에 있고, 유기동물은 발견된 지자체로 접수되므로 이것이 사실상
 * 발견 지역이다. region은 "경기도 화성시" 형태로 넘긴다.
 */
export const fetchAnimalsByRegion = ({ region, limit = 8 } = {}) =>
  client
    .get("/api/shelter/animals", { params: { region, limit } })
    .then((r) => r.data);

/**
 * 한 실종 신고와 맞아 보이는 보호동물.
 *
 * region은 실종 지점의 관할 지자체다. 공공 API가 발견 지점의 좌표를 주지
 * 않아 거리로는 좁힐 수 없어서, 좌표를 지역명으로 바꾸는 일은 카카오 SDK를
 * 쓸 수 있는 이쪽에서 맡는다.
 */
export const fetchShelterMatches = ({ missingId, region }) =>
  client
    .get("/api/shelter/matches", { params: { missingId, region } })
    .then((r) => r.data);
