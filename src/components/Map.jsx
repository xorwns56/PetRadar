
import { useEffect, useRef } from "react";

const Map = ({ shelters, onSelect }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5c8a6ed6eae576f83f70e75198543b79&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.870117, 126.98354),
          level: 7,
        });

        const geocoder = new window.kakao.maps.services.Geocoder();

        shelters.forEach((shelter) => {
          const address =
            shelter.REFINE_LOTNO_ADDR || shelter.REFINE_ROADNM_ADDR;
          if (!address) {
            console.warn(`주소 데이터가 없습니다: ${shelter.SHTER_NM}`);
            return;
          }
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
                onSelect && onSelect(shelter);
              });
            } else {
              console.warn(`지오코딩 실패: ${address}`);
            }
          });
        });
      });
    };
    document.head.appendChild(script);
  }, [shelters, onSelect]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", borderRadius: "10px" }}
    />
  );
};

export default Map;
