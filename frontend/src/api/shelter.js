/**
 * 경기데이터드림 유기동물 보호 현황.
 *
 * 백엔드를 거치지 않고 브라우저에서 바로 부른다. 키가 소스에 박혀 있어
 * 그대로 노출되는데, 공공데이터포털 전국 데이터로 옮기면서 백엔드
 * 프록시(app.shelter.service-key)로 넘길 예정이다.
 */
const API_KEY = "f2f06fff472f435591f277efff82fd36";
const ENDPOINT = "https://openapi.gg.go.kr/AbdmAnimalProtect";

/** 보호 중인 유기동물 목록 (최대 100건) */
export const fetchShelterAnimals = async ({ size = 100 } = {}) => {
  const url = `${ENDPOINT}?Key=${API_KEY}&Type=json&pIndex=1&pSize=${size}`;
  const res = await fetch(url);
  if (!res.ok) {
    // fetch는 4xx/5xx를 예외로 보지 않으므로 직접 확인한다
    throw new Error(`보호소 API 응답 오류: ${res.status}`);
  }
  const json = await res.json();
  return json.AbdmAnimalProtect?.[1]?.row || [];
};
