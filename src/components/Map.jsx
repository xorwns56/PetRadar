import { useEffect, useRef } from "react";
import "../style/Map.css";

const Map = ({ shelters, onSelect, setCenterRef }) => {
  const mapRef = useRef(null); // 맵 DOM 참조
  const mapInstance = useRef(null); // 지도 객체 저장
  const geocoderInstance = useRef(null); // 지오코더 저장
  const hasCentered = useRef(false); // 초기 중심 고정 후 이동 방지

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5c8a6ed6eae576f83f70e75198543b79&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5598, 126.9734),
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

          // 나머지 처리
        });

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
              const marker = new window.kakao.maps.Marker({
                map,
                position: coords,
              });
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:13px">${shelter.SHTER_NM}</div>`,
              });

              window.kakao.maps.event.addListener(marker, "click", () => {
                infowindow.open(map, marker);
                map.panTo(marker.getPosition()); // ← 부드럽게 이동
                onSelect?.(shelter);
                console.log(
                  shelter.SHTER_NM,
                  address,
                  result[0].y,
                  result[0].x
                );

                map.setLevel(5);
              });
            }
          });
        });
      });
    };
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

    script.onerror = () => {
      console.error("카카오맵 스크립트 로드 실패");
    };

    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Map">
      <div ref={mapRef} className="Map-box" />
    </div>
  );
};

export default Map;
