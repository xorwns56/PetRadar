import { useEffect, useRef, useState } from "react";

const ReportMap = ({ onSelect }) => {
  const [reportLocation, setReportLocation] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=e26cd2b9a98785f9299bd0fe37542aab&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 지도 확인
      console.log("[1] kakao script loaded");

      window.kakao.maps.load(() => {
        // 지도 확인
        console.log("[2] kakao maps loaded");

        const reportMapContainer = document.getElementById("reportMap");
        // 지도 확인
        console.log("[3] reportMapContainer:", reportMapContainer);

        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const map = new window.kakao.maps.Map(reportMapContainer, options);
        // 지도 확인
        console.log("[4] map object created:", map);
        setReportLocation(map);

        window.kakao.maps.event.addListener(
          map,
          "click",
          function (mouseEvent) {
            // 지도 확인
            console.log("[5] map clicked");
            const location = mouseEvent.latLng;
            console.log("[6] clicked location:", location);

            if (markerRef.current) {
              // 지도 확인
              console.log("[7] removing existing marker");
              markerRef.current.setMap(null);
            }

            const newMarker = new window.kakao.maps.Marker({
              position: location,
            });
            // 지도 확인
            console.log("[8] new marker created:", newMarker);
            newMarker.setMap(map);
            markerRef.current = newMarker;
            console.log("[9] marker set and stored in ref");
            console.log("[MARKER REF]", markerRef.current);

            if (onSelect) {
              // 지도 확인
              console.log("[10] calling onLocationSelect");
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
  return <div id="reportMap" style={{ width: "100%", height: "350px" }}></div>;
};
export default ReportMap;
