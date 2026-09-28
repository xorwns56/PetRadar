// 카카오 지도 SDK 로더.
// 지도를 쓰는 컴포넌트가 각자 <script>를 붙이던 것을 한곳으로 모았다.
// 예전에는 컴포넌트가 마운트될 때마다 태그가 새로 붙고 지워지지 않아
// 지도 화면을 오갈수록 같은 스크립트가 쌓였다.
//
// 이미 로드됐으면 즉시 반환하고, 로딩 중이면 같은 Promise를 돌려주므로
// 여러 지도가 한 화면에 있어도 요청은 한 번만 나간다.

// 브라우저에 그대로 노출되는 클라이언트 키다. 숨길 수 있는 값이 아니라
// 카카오 콘솔의 도메인 제한으로 보호한다. 키를 바꿀 때는 여기만 고치면 된다.
const APP_KEY = "b737c6777956f74337fc9bc5a08e3b55";

const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services&autoload=false`;

/**
 * 현재 위치를 못 받았을 때 지도가 서는 자리 (서울시청).
 *
 * 예전에는 지도 세 곳이 각각 다른 동네 좌표를 갖고 있었다(배곧 두 곳, 판교 한 곳).
 * 특정 동네를 콕 집는 건 어차피 추측이라, 인구가 가장 많이 몰린 곳을 쓴다.
 */
export const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

/** 마커가 하나도 없어 전국을 보여줄 때의 중심 (대한민국 중심부) */
export const NATIONWIDE_CENTER = { lat: 36.5, lng: 127.85 };

/** 전국이 한눈에 들어오는 줌 레벨. 숫자가 클수록 넓게 보인다.
 *  13 이상으로 올리면 카카오 타일이 없는 영역까지 나와 회색 여백이 생긴다 */
export const NATIONWIDE_LEVEL = 12;

/**
 * 장소를 "찍는" 지도의 배율 (신고·제보 폼).
 * 화면에 약 2.5 × 1.2km — 아파트·학교·공원 이름이 또렷하게 읽힌다.
 * 정확히 찍어야 하는 화면이라 가깝게 둔다.
 */
export const NEIGHBORHOOD_LEVEL = 5;

/**
 * 내 주변을 "둘러보는" 지도의 배율 (홈).
 * 화면에 약 2.5 × 1.2km — 걸어서 오갈 만한 범위다.
 * 더 넓히면 "내 주변"이라기엔 멀어지고, 겹치는 마커는 클러스터가 처리한다.
 */
export const OVERVIEW_LEVEL = 5;

/** 정확한 지점으로 이동했을 때 (검색 결과 선택, 저장된 위치 불러오기) */
export const PINPOINT_LEVEL = 3;

/** 마커가 하나뿐일 때. 주변 지형이 같이 보일 만큼은 물려 둔다 */
export const SINGLE_POINT_LEVEL = 5;

/**
 * 좌표 목록이 모두 보이도록 지도 범위를 맞춘다.
 * 좌표가 없으면 기본 좌표로 넓게 돌아간다.
 *
 * @param map    kakao.maps.Map
 * @param points [{ lat, lng }, ...]
 */
export function fitBoundsTo(map, points) {
  const valid = (points || []).filter(
    (p) => p && p.lat != null && p.lng != null
  );

  if (valid.length === 0) {
    map.setCenter(
      new window.kakao.maps.LatLng(NATIONWIDE_CENTER.lat, NATIONWIDE_CENTER.lng)
    );
    map.setLevel(NATIONWIDE_LEVEL);
    return;
  }

  // 한 곳뿐이면 setBounds를 쓰지 않는다.
  // 범위가 점 하나라 최대 배율까지 당겨 버리고, 그걸 setLevel로 되돌리면
  // 재배치가 겹쳐 타일이 군데군데 비어 버린다
  if (valid.length === 1) {
    map.setCenter(new window.kakao.maps.LatLng(valid[0].lat, valid[0].lng));
    map.setLevel(SINGLE_POINT_LEVEL);
    return;
  }

  const bounds = new window.kakao.maps.LatLngBounds();
  valid.forEach((p) =>
    bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng))
  );
  map.setBounds(bounds);
}

let loadPromise = null;

/**
 * 카카오 지도 SDK를 불러온다.
 * @returns {Promise<typeof window.kakao>} maps 네임스페이스까지 준비된 kakao 객체
 */
export function loadKakaoMap() {
  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;

    // autoload=false로 받았으므로 maps 네임스페이스는 load()를 호출해야 준비된다
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));

    script.onerror = () => {
      // 실패한 Promise를 남겨두면 이후 호출이 전부 같은 실패를 되돌려받는다.
      // 초기화해서 다음 시도에 다시 받아올 수 있게 한다
      loadPromise = null;
      script.remove();
      reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 좌표를 관할 지자체 이름으로 바꾼다 ("경기도 화성시").
 *
 * 보호동물의 발견 지점은 공공 API에 좌표가 없고 관할 지자체(orgNm)만 있다.
 * 그래서 "내 주변 보호동물"을 좁히려면 거리가 아니라 이 이름으로 맞춰야 한다.
 * 공공 API 표기와 같은 형태("시도 시군구")로 돌려준다.
 *
 * @returns {Promise<string|null>} 못 구하면 null
 */
export async function toRegionName(lat, lng) {
  await loadKakaoMap();
  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !result.length) {
        resolve(null);
        return;
      }
      // 행정동(H)과 법정동(B)이 함께 오는데 시·군·구 이름은 어느 쪽이나 같다
      const region = result.find((r) => r.region_type === "H") || result[0];
      const sido = region.region_1depth_name;
      const sigungu = region.region_2depth_name;
      resolve(sigungu ? `${sido} ${sigungu}` : sido);
    });
  });
}
