import { useEffect, useRef } from "react";
import { loadKakaoMap } from "../../lib/kakaoMap";

/**
 * 좌표 한 점만 보여주는 지도.
 *
 * 끌거나 확대할 일이 없는 자리(실종 지점, 제보 지점)에 쓴다. StaticMap은
 * 이미지 한 장이라 일반 지도보다 가볍고, 모달·상세처럼 스크롤이 있는 곳에서
 * 지도가 스크롤을 가로채는 문제도 없다.
 *
 * 마이페이지 제보 모달에만 있던 것을 실종 상세도 쓰게 되어 공용으로 올렸다.
 */
const StaticPointMap = ({ point, level = 4, className = "size-full" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!point?.lat || !point?.lng) return;

    // SDK가 도착하기 전에 언마운트되거나 좌표가 바뀌면 지난 요청의 결과는 버린다
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        // StaticMap은 다시 그릴 수 없어 새로 만든다. 비우지 않으면 겹쳐 쌓인다
        containerRef.current.innerHTML = "";
        const center = new window.kakao.maps.LatLng(point.lat, point.lng);
        new window.kakao.maps.StaticMap(containerRef.current, {
          center,
          level,
          marker: { position: center },
        });
      })
      .catch((error) => console.error("카카오맵 스크립트 로드 실패", error));

    return () => {
      cancelled = true;
    };
  }, [point?.lat, point?.lng, level]);

  return <div ref={containerRef} className={className} />;
};

export default StaticPointMap;
