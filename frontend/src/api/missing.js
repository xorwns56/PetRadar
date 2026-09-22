import { client } from "./client";

/**
 * 실종 글 목록.
 * 검색어가 있으면 Elasticsearch 전문 검색(/api/search)으로 관련도 순 결과를,
 * 없으면 목록 API로 정렬(최신순/오래된순) 결과를 받는다.
 */
export const fetchMissingList = ({ searchInput = "", sortType = "latest" } = {}) =>
  searchInput.trim()
    ? client.get("/api/search", { params: { searchInput } }).then((r) => r.data)
    : client.get("/api/missing", { params: { sortType } }).then((r) => r.data);

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
