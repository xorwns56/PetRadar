import { useEffect, useRef, useState } from "react";
import Map from "../components/Map";
import Modal from "../components/Modal";
import ShelterDetail from "../components/ShelterDetail";
import useShelterData from "../api/ShelterData";
import ShelterListSection from "../components/ListItem";
import "../style/ShelterList.css";

const ShelterList = () => {
  const { animals, error } = useShelterData();
  const [selectedShelter, setSelectedShelter] = useState(null);
  const mapRef = useRef(null);
  const [dots, setDots] = useState("");
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
    setSelectedShelter(shelter);
    if (mapRef.current) {
      mapRef.current(shelter); // 지도 중심 이동
    }
  };

  if (error) return <div>에러 발생</div>;
  if (!Array.isArray(animals)) return <div>불러오는 중...</div>;
  if (!animals.length)
    return (
      <div>
        <span className="load">로딩중{dots}</span>
      </div>
    );

  return (
    <>
      <Map
        shelters={uniqueShelters}
        onSelect={(shelter) => {
          setSelectedShelter(shelter);
          if (mapRef.current) mapRef.current(shelter);
        }}
        setCenterRef={mapRef}
      />

      {selectedShelter && (
        <Modal onClose={() => setSelectedShelter(null)}>
          <ShelterDetail shelter={selectedShelter} />
        </Modal>
      )}

      <div>
        <ShelterListSection
          shelters={uniqueShelters}
          onItemClick={handleItemClick}
          selected={selectedShelter}
        />
      </div>
    </>
  );
};

export default ShelterList;
