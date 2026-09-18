import { useEffect, useRef } from "react";
import { loadKakaoMap } from "../lib/kakaoMap";

const MyPageReportMap = ({ petReportPoint }) => {
  const mapRef = useRef(null);
  const staticMapRef = useRef(null);

  const initializeStaticMap = () => {
    if (mapRef.current) {
      mapRef.current.innerHTML = "";
    }
    const center = new window.kakao.maps.LatLng(
      petReportPoint.lat,
      petReportPoint.lng
    );
    const marker = { position: center };
    const options = {
      center,
      level: 3,
      marker,
    };
    staticMapRef.current = new window.kakao.maps.StaticMap(
      mapRef.current,
      options
    );
  };

  useEffect(() => {
    if (!petReportPoint) return;
    // SDK가 도착하기 전에 언마운트되거나 좌표가 바뀌면 지난 요청의 결과는 버린다
    let cancelled = false;
    loadKakaoMap()
      .then(() => {
        if (cancelled) return;
        initializeStaticMap();
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [petReportPoint]);
  return <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>;
};
export default MyPageReportMap;
