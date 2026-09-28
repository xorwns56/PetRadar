/* 공공데이터포털 표기를 화면 문구로. 여러 화면이 같은 변환을 각자 하던 것을 모았다 */

/** "20260928" → "2026-09-28" */
export const formatPublicDate = (value) => {
  if (!value || value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

/** 공공 API는 성별 미상을 Q로 준다 (9%쯤 된다) */
export const formatSex = (code) =>
  ({ M: "수컷", F: "암컷" }[code] ?? "미상");

/** 중성화 여부. U는 확인되지 않은 것이다 */
export const formatNeutered = (code) =>
  ({ Y: "완료", N: "안 함" }[code] ?? "미상");
