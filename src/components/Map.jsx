import { useEffect, useRef } from "react";
import "../style/Map.css";

const Map = ({ shelters, onSelect, setCenterRef }) => {
  const mapRef = useRef(null); // 맵 DOM 요소 참조
  const mapInstance = useRef(null); // 지도 객체 저장
  const geocoderInstance = useRef(null); // 지오코더 객체 저장
  const hasCentered = useRef(false); // 지도 중심 이동 제어용

  useEffect(() => {
    // 카카오맵 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=a62ab991b478d4cfb3a3e5b0c93a3148&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 카카오맵 라이브러리 로드 후 실행
      window.kakao.maps.load(() => {
        // 지도 객체 생성 및 초기화
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5598, 126.9734), // 초기 중심 좌표(서울)
          level: 12, // 초기 줌 레벨
        });
        mapInstance.current = map; // 지도 객체 저장
        const geocoder = new window.kakao.maps.services.Geocoder(); // 지오코더 객체 생성
        geocoderInstance.current = geocoder; // 지오코더 저장

        if (!Array.isArray(shelters)) return; // shelters가 배열이 아니면 종료

        // 각 보호소에 대해 마커 생성
        shelters.forEach((shelter) => {
          const address =
            shelter.REFINE_LOTNO_ADDR || shelter.REFINE_ROADNM_ADDR; // 지번 또는 도로명 주소 사용
          if (!address) return; // 주소 없으면 건너뜀

          geocoder.addressSearch(address, (result, status) => {
            // 주소를 좌표로 변환
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(
                result[0].y,
                result[0].x
              );
              // 마커 생성
              const marker = new window.kakao.maps.Marker({
                map,
                position: coords,
              });
              // 마커 클릭 시 표시될 정보창 생성
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:13px">${shelter.SHTER_NM}</div>`,
              });

              // 마커 클릭 이벤트 등록
              window.kakao.maps.event.addListener(marker, "click", () => {
                infowindow.open(map, marker); // 정보창 열기
                map.panTo(marker.getPosition()); // 지도 중심을 마커 위치로 부드럽게 이동
                onSelect?.(shelter); // 보호소 선택 콜백 호출
                console.log(
                  shelter.SHTER_NM,
                  address,
                  result[0].y,
                  result[0].x
                );
                map.setLevel(5); // 줌 레벨 변경
              });
            }
          });
        });
      });
    };

    // 외부에서 지도 중심을 이동시키고 싶을 때 사용할 ref 함수 등록
    if (setCenterRef) {
      setCenterRef.current = (shelter) => {
        const addr = shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR;
        if (!addr || !geocoderInstance.current || !mapInstance.current) return;

        // 주소를 좌표로 변환 후 지도 중심 이동
        geocoderInstance.current.addressSearch(addr, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            const current = mapInstance.current.getCenter();

            // 현재 중심과 다르면 이동
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

    // 스크립트 로드 실패 시 에러 출력
    script.onerror = () => {
      console.error("카카오맵 스크립트 로드 실패");
    };

    // 스크립트 태그를 문서에 추가
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Map">
      {/* 카카오맵이 렌더링될 컨테이너 */}
      <div ref={mapRef} className="Map-box" />
    </div>
  );
};

export default Map;
