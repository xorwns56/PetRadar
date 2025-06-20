import { useParams } from "react-router-dom";
import useShelterData from "../api/ShelterData";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import "../style/ShelterList.css";

const ShelterDetailPage = () => {
  const { name, addr } = useParams();
  const { animals } = useShelterData();
  const [filtered, setFiltered] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    const decodedName = decodeURIComponent(name);
    const decodedAddr = decodeURIComponent(addr);

    const result = animals.filter(
      (a) => a.CARE_NM === decodedName && a.REFINE_ROADNM_ADDR === decodedAddr
    );
    setFiltered(result);
  }, [animals, name, addr]);

  return (
    <div className="MissingList">
      <div className="MissingList-container inner">
        <div className="menu-title">
          <h3>{decodeURIComponent(name)} 동물 목록</h3>
        </div>

        <div className="MissingItems">
          {filtered.map((a) => (
            <div
              className="MissingItem"
              key={a.PBLANC_IDNTFY_NO}
              onClick={() => setSelectedAnimal(a)}
            >
              <div className="thumb" style={{ background: "#ddd" }}>
                <img src={a.IMAGE_COURS || "/noimage.png"} alt="유기동물" />
              </div>
              <div className="content">
                <span className="type">{a.SPECIES_NM}</span>
                <span className="name">{a.KIND_NM || "정보 없음"}</span>
                <p>발견 장소: {a.DISCVRY_PLC_INFO}</p>
                <p>공고번호: {a.PBLANC_IDNTFY_NO}</p>
                <p>보호상태: {a.STATE_NM}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAnimal && (
        <Modal onClose={() => setSelectedAnimal(null)}>
          <div className="animal-popup">
            <img
              src={selectedAnimal.IMAGE_COURS || "/noimage.png"}
              alt="동물 이미지"
              width="100%"
            />
            <h3>{selectedAnimal.SPECIES_NM}</h3>
            <p>품종: {selectedAnimal.KIND_NM}</p>
            <p>색상: {selectedAnimal.COLOR_NM}</p>
            <p>발견 장소: {selectedAnimal.DISCVRY_PLC_INFO}</p>
            <p>공고번호: {selectedAnimal.PBLANC_IDNTFY_NO}</p>
            <p>보호 상태: {selectedAnimal.STATE_NM}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ShelterDetailPage;
