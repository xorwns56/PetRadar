import { useEffect, useRef } from "react";
import { loadKakaoMap } from "../../lib/kakaoMap";

const ShelterMap = ({ shelters, onSelect, setCenterRef }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const geocoderInstance = useRef(null);

  useEffect(() => {
    // SDK가 도착하기 전에 언마운트되면 결과를 버린다
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled) return;
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.423233, 127.105261),
          level: 12,
        });
        mapInstance.current = map;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoderInstance.current = geocoder;

        if (!Array.isArray(shelters)) return;

        shelters.forEach((shelter) => {
          const address =
            shelter.REFINE_LOTNO_ADDR || shelter.REFINE_ROADNM_ADDR;
          if (!address) return;

          geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(
                result[0].y,
                result[0].x
              );

              // <div> + <img> 형태로 마커 생성
              const markerWrapper = document.createElement("div");
              // 지도가 직접 만드는 DOM이라 JSX가 아니지만, 클래스 문자열이
              // 소스에 그대로 있으므로 Tailwind가 찾아낸다
              markerWrapper.className =
                "flex size-12 cursor-pointer items-center justify-center transition duration-300 hover:scale-150";

              const img = document.createElement("img");
              img.src = "/orangeMarker.png";
              img.alt = "marker";
              img.className = "pointer-events-none size-full object-contain";

              markerWrapper.appendChild(img);

              markerWrapper.addEventListener("click", () => {
                map.panTo(coords);
                map.setLevel(5);
                onSelect?.(shelter);
              });

              const overlay = new window.kakao.maps.CustomOverlay({
                position: coords,
                content: markerWrapper,
                yAnchor: 1,
              });

              overlay.setMap(map);
            }
          });
        });
      })
      .catch((error) => console.error("카카오맵 스크립트 로드 실패", error));

    if (setCenterRef) {
      setCenterRef.current = (shelter) => {
        const addr = shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR;
        if (!addr || !geocoderInstance.current || !mapInstance.current) return;

        geocoderInstance.current.addressSearch(addr, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            const current = mapInstance.current.getCenter();

            if (
              current.getLat() !== coords.getLat() ||
              current.getLng() !== coords.getLng()
            ) {
              mapInstance.current.panTo(coords);
              mapInstance.current.setLevel(9);
            }
          }
        });
      };
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 높이는 쓰는 쪽이 정한다. 예전에는 Map.css가 350px로 못박아 두어
  // 감싸는 상자가 그보다 낮으면 지도가 잘렸다
  return <div ref={mapRef} className="size-full" />;
};

export default ShelterMap;
