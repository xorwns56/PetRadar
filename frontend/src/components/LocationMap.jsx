import { useEffect, useRef, useState } from "react";

const AppKey = "b737c6777956f74337fc9bc5a08e3b55";

// 현재 위치를 받지 못했을 때 쓰는 기본 좌표
const FALLBACK_CENTER = { lat: 37.374659507684, lng: 126.73570005568 };

const LocationMap = ({ init, onSelect }) => {
  const [location, setLocation] = useState(null);
  const markerRef = useRef(null);
  const isInit = useRef(false);

  const handleMapClick = (map, latlng) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const markerImage = new window.kakao.maps.MarkerImage(
      "/orangeMarker.png",
      new window.kakao.maps.Size(40, 40),
      { offset: new window.kakao.maps.Point(20, 40) }
    );

    const newMarker = new window.kakao.maps.Marker({
      position: latlng,
      image: markerImage,
    });

    newMarker.setMap(map);
    markerRef.current = newMarker;

    if (onSelect) {
      onSelect({
        lat: latlng.getLat(),
        lng: latlng.getLng(),
      });
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${AppKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const locationMapContainer = document.getElementById("locationMap");

        const options = {
          center: new window.kakao.maps.LatLng(
            FALLBACK_CENTER.lat,
            FALLBACK_CENTER.lng
          ),
          level: 3,
        };

        const map = new window.kakao.maps.Map(locationMapContainer, options);
        setLocation(map);

        // 현재 위치로 지도를 옮긴다. 위치 조회는 비동기라 우선 기본 좌표로 띄운 뒤 이동시킨다.
        // 마커는 찍지 않는다 — 실종 장소는 지금 있는 곳과 다를 수 있으므로 사용자가 직접 고르게 한다.
        // 수정 화면(init)은 저장된 위치를 보여줘야 하므로 건너뛴다.
        if (!init && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // 수정 화면은 init이 뒤늦게 도착한다. 그 사이 응답이 오더라도
              // 저장된 위치가 이미 적용됐다면 덮어쓰지 않는다
              if (isInit.current) return;
              map.setCenter(
                new window.kakao.maps.LatLng(
                  position.coords.latitude,
                  position.coords.longitude
                )
              );
            },
            // 권한 거부, 조회 실패, HTTP 환경 등에서는 기본 좌표를 그대로 쓴다
            () => {}
          );
        }

        window.kakao.maps.event.addListener(
          map,
          "click",
          function (mouseEvent) {
            const clickedLocation = mouseEvent.latLng;
            handleMapClick(map, clickedLocation);
          }
        );
      });
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isInit.current && init && location) {
      handleMapClick(
        location,
        new window.kakao.maps.LatLng(init.lat, init.lng)
      );
      isInit.current = true;
      location.setCenter(new window.kakao.maps.LatLng(init.lat, init.lng));
    }
  }, [init, location]);

  return (
    <div id="locationMap" style={{ width: "100%", height: "350px" }}></div>
  );
};

export default LocationMap;
