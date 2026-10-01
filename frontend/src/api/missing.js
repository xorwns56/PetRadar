import { client } from "./client";

/**
 * 실종 글 목록 (페이지 단위).
 * 검색어가 있으면 전문 검색(/api/search)으로 관련도 순 결과를,
 * 없으면 목록 API로 정렬(최신순/오래된순) 결과를 받는다.
 * 두 경로 모두 같은 Page 모양으로 온다: { content, totalElements, totalPages, ... }
 *
 * page는 0부터 센다(Spring). 화면은 1부터 세므로 부르는 쪽에서 맞춘다.
 */
export const fetchMissingList = ({
  searchInput = "",
  sortType = "latest",
  page = 0,
  size = 12,
} = {}) =>
  searchInput.trim()
    ? client
        .get("/api/search", { params: { searchInput, page, size } })
        .then((r) => r.data)
    : client
        .get("/api/missing", { params: { sortType, page, size } })
        .then((r) => r.data);

/**
 * 지도용 전체 목록.
 * 지도는 화면에 들어오는 것을 스스로 골라 그리므로 페이지로 자르면
 * 마커가 임의로 빠진다. 좌표가 있는 글만 온다.
 */
export const fetchMissingPoints = () =>
  client.get("/api/missing/points").then((r) => r.data);

/** 내가 신고한 글 */
export const fetchMyMissingList = () =>
  client.get("/api/missing/me").then((r) => r.data);

export const fetchMissingDetail = (id) =>
  client.get(`/api/missing/${id}`).then((r) => r.data);

// 등록·수정은 multipart로 보낸다 (missing: JSON 파트, image: 파일 파트)
export const createMissing = (formData) => client.post("/api/missing", formData);

export const updateMissing = (id, formData) =>
  client.patch(`/api/missing/${id}`, formData);

export const deleteMissing = (id) => client.delete(`/api/missing/${id}`);
