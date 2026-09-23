/**
 * 브라우저 위치 조회.
 * 카카오와 무관한 브라우저 API라 지도 로더와 따로 둔다.
 */

/**
 * 현재 권한 상태. "granted" | "denied" | "prompt"
 * Permissions API가 없는 브라우저에서는 "prompt"로 본다 — 팝업이 뜰 수도
 * 있다고 가정하는 쪽이 안전하다(타임아웃을 걸지 않는다).
 */
export async function getPermissionState() {
  if (!navigator.permissions?.query) return "prompt";
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "prompt";
  }
}

/**
 * 권한이 바뀌면 알려준다. 해제 함수를 돌려준다.
 *
 * 처음에 차단했다가 나중에 주소창 자물쇠에서 허용으로 바꾸는 경우를 잡는다.
 * 이게 없으면 사용자가 "내 위치로"를 직접 눌러야 한다.
 */
export async function watchPermission(onChange) {
  if (!navigator.permissions?.query) return () => {};
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    const handler = () => onChange(status.state);
    status.addEventListener("change", handler);
    return () => status.removeEventListener("change", handler);
  } catch {
    return () => {};
  }
}

/**
 * 현재 위치를 받아온다.
 * 권한 거부·조회 실패·HTTP 환경에서는 null을 돌려준다 — 부르는 쪽이
 * 기본 좌표로 넘어갈 수 있도록 예외 대신 null로 알린다.
 *
 * timeout을 상황에 따라 다르게 건다. 명세상 이 시간은 권한 팝업을 기다리는
 * 동안은 세지 않아야 하는데 크롬은 포함해서 세기 때문이다. 5초로 뒀을 때
 * 사용자가 팝업을 읽는 사이에 타임아웃이 나서, "허용"을 눌러도 지도가
 * 안 움직이고 새로고침해야 반영됐다.
 *
 *   이미 허용됨 — 팝업이 안 뜨므로 타임아웃이 안전하다. 측위가 멈추는 경우를
 *                 대비해 건다. 허용된 뒤의 측위는 보통 1~3초다
 *   그 외       — 팝업이 뜰 수 있으므로 걸지 않는다. 누르는 순간 조회가 끝난다
 *
 * maximumAge는 항상 준다 — 최근에 받은 좌표가 있으면 다시 재지 않는다.
 */
export async function getCurrentPosition({ maximumAge = 60000 } = {}) {
  if (!navigator.geolocation) return null;

  const options = { maximumAge };
  if ((await getPermissionState()) === "granted") options.timeout = 10000;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      options
    );
  });
}
