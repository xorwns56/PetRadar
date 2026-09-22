import { client } from "./client";

/** 특정 실종 글에 달린 제보를 페이지 단위로 */
export const fetchReportsByMissing = (missingId, { page = 0, size = 2 } = {}) =>
  client
    .get(`/api/report/missing/${missingId}`, {
      params: { page, size, sort: "createdAt,desc" },
    })
    .then((r) => r.data);

// multipart (report: JSON 파트, image: 파일 파트)
export const createReport = (missingId, formData) =>
  client.post(`/api/report/missing/${missingId}`, formData);
