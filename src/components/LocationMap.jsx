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
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const map = new window.kakao.maps.Map(locationMapContainer, options);
        setLocation(map);

        window.kakao.maps.event.addListener(
          map,
          "click",
          function (mouseEvent) {
            const location = mouseEvent.latLng;

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            const newMarker = new window.kakao.maps.Marker({
              position: location,
            });
            newMarker.setMap(map);
            markerRef.current = newMarker;

            if (onSelect) {
              onSelect({
                lat: location.getLat(),
                lng: location.getLng(),
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
