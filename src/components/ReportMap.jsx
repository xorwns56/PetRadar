import { useEffect, useRef, useState } from "react";

const ReportMap = ({onLocationSelect}) => {
    const [reportLocation, setReportLocation] = useState(null);
    const markerRef = useRef(null)

    useEffect(() =>{
        if (!window.kakao || !window.kakao.maps) return;

        const reportMapContainer = document.getElementById("reportMap");
        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level : 3,
        }

        const map = new window.kakao.maps.Map(reportMapContainer, options);
        setReportLocation(map)

        window.kakao.maps.event.addListener(map, "click", function(mouseEvent) {
            const location = mouseEvent.latLng;

            if(markerRef.current) {
                markerRef.current.setMap(null)
            }

            const newMarker = new window.kakao.maps.Marker({
                position: location
            })
            newMarker.setMap(map)
            markerRef.current = newMarker

            if(onLocationSelect) {
                onLocationSelect({
                    lat: location.getLat(),
                    lng: location.getLng(),
                })
            }
        })
    },[])
  return <div id="reportMap" style={{ width: "100%", height: "350px" }}></div>
};
export default ReportMap;
