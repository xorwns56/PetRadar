import { useState } from "react";
import Map from "../components/Map";
import Modal from "../components/Modal";
import ShelterDetail from "../components/ShelterDetail";
import useShelterData from "../api/ShelterData";

const ShelterList = () => {
  const { animals, error } = useShelterData();
  const [selectedShelter, setSelectedShelter] = useState(null); // ✅ 선택된 보호소

  if (error) return <div>에러 발생</div>;
  if (!Array.isArray(animals)) return <div>불러오는 중...</div>;

  return (
    <>
      <Map
        shelters={animals}
        onSelect={(shelter) => {
          console.log("선택됨:", shelter);
          setSelectedShelter(shelter);
        }}
      />

      {selectedShelter && (
        <Modal onClose={() => setSelectedShelter(null)}>
          <ShelterDetail shelter={selectedShelter} />
        </Modal>
      )}
    </>
  );
};

export default ShelterList;
