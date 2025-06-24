import { useEffect, useRef, useState } from "react";

const LocationMap = ({ onSelect }) => {
  const [location, setLocation] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=e26cd2b9a98785f9299bd0fe37542aab&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const locationMapContainer = document.getElementById("locationMap");

        const options = {
          center: new window.kakao.maps.LatLng(
            37.374659507684,
            126.73570005568
          ),
          level: 3,
        };

        const map = new window.kakao.maps.Map(locationMapContainer, options);
        setLocation(map);

        window.kakao.maps.event.addListener(
          map,
          "click",
          function (mouseEvent) {
            const clickedLocation = mouseEvent.latLng;

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 이미지 마커 설정
            const markerImage = new window.kakao.maps.MarkerImage(
              "/orangeMarker.png", // <-- 여기에 마커로 쓸 이미지 경로
              new window.kakao.maps.Size(40, 40), // 마커 크기
              { offset: new window.kakao.maps.Point(20, 40) } // 기준점 위치
            );

            const newMarker = new window.kakao.maps.Marker({
              position: clickedLocation,
              image: markerImage,
            });

            newMarker.setMap(map);
            markerRef.current = newMarker;

            if (onSelect) {
              onSelect({
                lat: clickedLocation.getLat(),
                lng: clickedLocation.getLng(),
              });
            }
          }
        );
      });
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div id="locationMap" style={{ width: "100%", height: "350px" }}></div>
  );
};

export default LocationMap;
