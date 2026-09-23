import { useCallback, useEffect, useState } from "react";
import {
  getCurrentPosition,
  getPermissionState,
  watchPermission,
} from "../lib/geolocation";

/**
 * 현재 위치와 그 상태를 함께 돌려준다.
 *
 * 위치를 쓰는 화면은 "못 받았을 때 어떻게 보여줄지"까지 책임져야 한다.
 * 좌표만 넘기면 화면은 기본 좌표와 실제 내 위치를 구분할 수 없어,
 * 엉뚱한 동네를 "내 주변"이라고 보여주게 된다.
 *
 * status를 다섯으로 나눈 이유는 화면에 띄울 말과 할 수 있는 일이 다르기 때문이다.
 *   "prompt"      아직 안 정함 — 팝업이 떠 있다. "허용해주세요"라고 안내한다
 *   "locating"    허용됐고 측위 중 — 허용한 사람에게 또 허용하라고 하면 안 된다
 *   "granted"     좌표를 받음
 *   "blocked"     브라우저가 차단 — 사이트가 팝업을 다시 띄울 수 없다.
 *                 다시 시도해봐야 즉시 같은 에러가 나므로 버튼 대신 푸는 법을 알린다
 *   "unavailable" 측위 실패 — 권한은 있는데 좌표를 못 구했다. 다시 시도할 만하다
 *
 * @returns {{ position, status, request }}
 */
export const useGeolocation = () => {
  const [state, setState] = useState({ status: "prompt", position: null });

  const request = useCallback(async () => {
    // 이미 허용된 상태면 팝업이 안 뜨므로 "찾는 중"이 맞다
    const permission = await getPermissionState();
    setState((prev) => ({
      ...prev,
      status: permission === "granted" ? "locating" : "prompt",
    }));

    const position = await getCurrentPosition();
    if (position) {
      setState({ status: "granted", position });
      return;
    }

    // 왜 실패했는지에 따라 사용자가 할 수 있는 일이 다르다.
    // 차단된 상태에서는 다시 시도해도 팝업이 뜨지 않는다
    const after = await getPermissionState();
    setState({
      status: after === "denied" ? "blocked" : "unavailable",
      position: null,
    });
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  // 처음에 차단했다가 나중에 주소창 자물쇠에서 바꾸는 경우를 잡는다.
  // 이게 없으면 사용자가 "내 위치로"를 직접 눌러야 한다
  useEffect(() => {
    let dispose = () => {};
    watchPermission((permission) => {
      if (permission === "granted") request();
      else if (permission === "denied") {
        setState({ status: "blocked", position: null });
      }
    }).then((fn) => {
      dispose = fn;
    });
    return () => dispose();
  }, [request]);

  return { ...state, request };
};

export default useGeolocation;
