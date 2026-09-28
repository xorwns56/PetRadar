import { useEffect, useRef } from "react";
import { fitBoundsTo, loadKakaoMap, NATIONWIDE_CENTER, NATIONWIDE_LEVEL } from "../../lib/kakaoMap";

/**
 * 보호소 위치 지도.
 *
 * 예전에는 보호소마다 주소를 카카오 Geocoder로 좌표로 바꿔 찍었다. 변환이
 * 제각각 끝나 범위를 언제 맞출지 다루기 까다로웠고, 주소 형식이 안 맞는
 * 보호소는 조용히 지도에서 빠졌다.
 * 지금은 공공데이터포털 동물보호센터 정보에 좌표가 함께 오므로 그걸 그대로 쓴다.
 *
 * 좌표가 없는 센터가 소수 있는데, 그런 곳은 목록에는 남기고 지도에서만 뺀다.
 */
const ShelterMap = ({ shelters, selectedId, onSelect }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled) return;
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(
            NATIONWIDE_CENTER.lat,
            NATIONWIDE_CENTER.lng
          ),
          level: NATIONWIDE_LEVEL,
        });
        draw();
      })
      .catch((error) => console.error("카카오맵 스크립트 로드 실패", error));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 목록이 바뀌면 (위치 허용으로 가까운 순이 되는 등) 마커를 다시 그린다
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelters]);

  const draw = () => {
    const map = mapRef.current;
    if (!map || !Array.isArray(shelters)) return;

    overlaysRef.current.forEach(({ overlay }) => overlay.setMap(null));
    overlaysRef.current = new Map();

    const points = [];
    shelters.forEach((shelter) => {
      if (shelter.lat == null || shelter.lng == null) return;
      const coords = new window.kakao.maps.LatLng(shelter.lat, shelter.lng);

      // 지도가 문서에 직접 꽂는 DOM이라 JSX가 아니지만,
      // 클래스 문자열이 소스에 그대로 있으므로 Tailwind가 찾아낸다
      const marker = document.createElement("div");
      marker.className =
        "flex size-12 cursor-pointer items-center justify-center transition duration-300 hover:scale-150";

      const img = document.createElement("img");
      img.src = "/orangeMarker.png";
      img.alt = "";
      img.className = "pointer-events-none size-full object-contain";
      marker.appendChild(img);

      marker.addEventListener("click", () => onSelect?.(shelter));

      const overlay = new window.kakao.maps.CustomOverlay({
        position: coords,
        content: marker,
        yAnchor: 1,
      });
      overlay.setMap(map);
      overlaysRef.current.set(shelter.careRegNo, { overlay, coords });
      points.push({ lat: shelter.lat, lng: shelter.lng });
    });

    fitBoundsTo(map, points);
  };

  // 목록에서 보호소를 고르면 지도도 따라 움직인다
  useEffect(() => {
    const map = mapRef.current;
    const target = selectedId && overlaysRef.current.get(selectedId);
    if (!map || !target) return;
    map.panTo(target.coords);
  }, [selectedId]);

  // 높이는 쓰는 쪽이 정한다
  return <div ref={containerRef} className="size-full" />;
};

export default ShelterMap;
