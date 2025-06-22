import '../style/ShelterList.css';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import useShelterData from '../api/ShelterData';
import Header from '../components/Header';

const ShelterList = () => {
  const { animals, error } = useShelterData();
  const [dots, setDots] = useState('');
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const uniqueShelters = animals.filter((shelter, index, self) => {
    const key = `${shelter.SHTER_NM}-${shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}`;
    return index === self.findIndex((s) => `${s.SHTER_NM}-${s.REFINE_ROADNM_ADDR || s.REFINE_LOTNO_ADDR}` === key);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (shelter) => {
    const name = encodeURIComponent(shelter.SHTER_NM);
    const addr = encodeURIComponent(shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR);
    navigate(`/shelter/${name}/${addr}`);
  };

  if (error) return <div>에러 발생</div>;
  if (!Array.isArray(animals)) return <div>불러오는 중...</div>;
  if (!animals.length)
    return (
      <div className="load-wrapper">
        <div className="img-box">
          <img src="/Menu-icon1.png" alt="dog-img" />
        </div>
        <span className="load">로딩중{dots}</span>
      </div>
    );

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
              if (mapRef.current) mapRef.current(shelter); // 지도 클릭시 아무 동작 X
            }}
            setCenterRef={mapRef}
          />
        </div>

        <div className="ShelterList-contents">
          {uniqueShelters.map((shelter, index) => (
            <div key={index} className="shelter-card">
              {/* 이미지 클릭 -> 보호소 상세정보 */}
              <img
                src={shelter.THUMB_IMAGE_COURS || '/image-default.png'}
                alt="썸네일"
                className="shelter-thumb"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/image-default.png';
                }}
              />
              {/* 이미지 클릭 -> 보호소 상세정보 */}
              <div className="shelter-info">
                <strong>{shelter.SHTER_NM}</strong>
                <p>{shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}</p>
              </div>
              <div className="ShelterAnimalList-btn" onClick={() => handleItemClick(shelter)}>
                <p>보호동물 보기 →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelterList;
