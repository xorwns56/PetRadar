import ShelterInfo from "../components/ShelterInfo";

import "../style/ShelterList.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useModal } from "../hooks/ModalContext";
import ShelterModalDetail from "../components/ShelterModalDetail";

import Map from "../components/Map";
import useShelterData from "../api/ShelterData";
import Header from "../components/Header";

// 로딩·에러·빈 결과가 같은 모양을 쓰도록 묶어둔다.
// 예전에는 에러와 로딩이 맨 <div> 한 줄이라 헤더도 없이 글자만 떴다
const ShelterNotice = ({ textRef, message, small }) => (
  <div className="load-wrapper">
    <div className="img-box">
      <img src="/Menu-icon1.png" alt="dog-img" />
    </div>
    <span ref={textRef} className={small ? "load load-message" : "load"}>
      {message}
    </span>
  </div>
);

const ShelterList = () => {
  const { animals, error, loading } = useShelterData();
  const mapRef = useRef(null);
  const loadingRef = useRef(null);

  const navigate = useNavigate();
  const { isActive, toggleModal } = useModal();
  const [selectedShelter, setSelectedShelter] = useState(null);

  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const ShelterInfoClick = (shelter) => {
    setSelectedAnimal(shelter);
    toggleModal();
  };

  const uniqueShelters = animals
    .filter((shelter, index, self) => {
      const key = `${shelter.SHTER_NM}-${
        shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
      }`;
      return (
        index ===
        self.findIndex(
          (s) =>
            `${s.SHTER_NM}-${s.REFINE_ROADNM_ADDR || s.REFINE_LOTNO_ADDR}` ===
            key
        )
      );
    })
    .slice(0, 5); // 상위 5개만 유지

  useEffect(() => {
    if (!loading) return; // 로딩이 끝나면 점 애니메이션도 멈춘다
    let count = 0;
    const interval = setInterval(() => {
      if (loadingRef.current) {
        const dots = ".".repeat(count % 4); // "", ".", "..", "..."
        loadingRef.current.textContent = `로딩중${dots}`;
        count++;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);
  const handleItemClick = (shelter) => {
    const name = encodeURIComponent(shelter.SHTER_NM);
    const addr = encodeURIComponent(
      shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
    );
    navigate(`/shelter/${name}/${addr}`);
  };

  // 응답이 비어 있어도 로딩 화면에 갇히지 않도록 loading을 먼저 본다
  if (loading) return <ShelterNotice textRef={loadingRef} message="로딩중" />;
  if (error)
    return <ShelterNotice message="보호소 정보를 불러오지 못했습니다." small />;
  if (!animals.length)
    return <ShelterNotice message="표시할 보호소 정보가 없습니다." small />;

  return (
    <div className="ShelterList">
      <Header leftChild={true} />
      <div className="ShelterList-container inner">
        <div className="PageTitle">
          <h3>보호소 정보</h3>
        </div>

        <div className="Map-wrapper">
          <Map
            shelters={uniqueShelters}
            onSelect={(shelter) => {
              if (mapRef.current) mapRef.current(shelter);
              setSelectedShelter(shelter);
              toggleModal();
            }}
            setCenterRef={mapRef}
          />
          {isActive && selectedShelter && (
            <ShelterInfo shelter={selectedShelter} onClose={toggleModal} />
          )}
        </div>

        <div className="ShelterList-contents">
          {uniqueShelters.map((shelter, index) => (
            <div
              key={index}
              className="shelter-card"
              onClick={() => ShelterInfoClick(shelter)}
            >
              <img
                src={"/image-default.png"}
                alt="썸네일"
                className="shelter-thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/image-default.png";
                }}
              />
              <div className="shelter-info">
                <strong>{shelter.SHTER_NM}</strong>
                <p>{shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}</p>
              </div>
              <div
                className="ShelterAnimalList-btn"
                onClick={(e) => {
                  e.stopPropagation(); //버튼 클릭 시 모달도 같이 열리는 걸 방지
                  handleItemClick(shelter);
                }}
              >
                <p>보호동물 보기 →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isActive && (
        <ShelterModalDetail
          animal={selectedAnimal}
          onClose={() => {
            toggleModal(); // 모달 닫기
            setSelectedAnimal(null); // 상태 초기화
          }}
        />
      )}
    </div>
  );
};

export default ShelterList;
