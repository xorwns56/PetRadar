import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import useShelterData from "../api/ShelterData";
import Header from "../components/Header";
import "../style/ShelterList.css";

const ShelterList = () => {
  const { animals, error } = useShelterData();
  const [dots, setDots] = useState("");
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const uniqueShelters = animals.filter((shelter, index, self) => {
    const key = `${shelter.SHTER_NM}-${
      shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
    }`;
    return (
      index ===
      self.findIndex(
        (s) =>
          `${s.SHTER_NM}-${s.REFINE_ROADNM_ADDR || s.REFINE_LOTNO_ADDR}` === key
      )
    );
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (shelter) => {
    const name = encodeURIComponent(shelter.SHTER_NM);
    const addr = encodeURIComponent(
      shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
    );
    navigate(`/shelter/${name}/${addr}`);
  };

  if (error) return <div>에러 발생</div>;
  if (!Array.isArray(animals)) return <div>불러오는 중...</div>;
  if (!animals.length)
    return (
      <div className="load-wrapper">
        <span className="load">로딩중{dots}</span>
      </div>
    );

  return (
    <div className="ShelterList">
      <Header leftChild={true} />
      <h2 className="PageTitle">보호소 정보</h2>

      <div className="inner">
        <div className="map-wrapper">
          <Map
            shelters={uniqueShelters}
            onSelect={(shelter) => {
              if (mapRef.current) mapRef.current(shelter); // 지도 클릭시 아무 동작 X
            }}
            setCenterRef={mapRef}
          />
        </div>

        <div className="ShelterList-container">
          {uniqueShelters.map((shelter, index) => (
            <div
              key={index}
              className="shelter-card"
              onClick={() => handleItemClick(shelter)}
            >
              <img
                src={shelter.THUMB_IMAGE_COURS || "/NoIMG.png"}
                alt="썸네일"
                className="shelter-thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/NoIMG.png";
                }}
              />
              <div className="shelter-info">
                <strong>{shelter.SHTER_NM}</strong>
                <p>{shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelterList;
