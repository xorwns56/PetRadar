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
