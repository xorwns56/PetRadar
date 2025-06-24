import { useEffect, useRef, useState } from "react";

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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=e26cd2b9a98785f9299bd0fe37542aab&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const locationMapContainer = document.getElementById("locationMap");

        const center = initPoint
          ? new window.kakao.maps.LatLng(initPoint.lat, initPoint.lng)
          : new window.kakao.maps.LatLng(37.374659507684, 126.73570005568);

        const options = {
          center,
          level: 3,
        };

        const map = new window.kakao.maps.Map(locationMapContainer, options);
        setLocation(map);

        // 이미지 마커 설정
        const markerImage = new window.kakao.maps.MarkerImage(
          "/orangeMarker.png", // <-- 여기에 마커로 쓸 이미지 경로
          new window.kakao.maps.Size(40, 40), // 마커 크기
          { offset: new window.kakao.maps.Point(20, 40) } // 기준점 위치
        );

        if (initPoint) {
          const initMarker = new window.kakao.maps.Marker({
            position: center,
            image: markerImage,
          });
          initMarker.setMap(map);
          markerRef.current = initMarker;
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
  }, [initPoint]);

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
