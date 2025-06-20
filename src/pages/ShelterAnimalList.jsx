import "../style/ShelterList.css";
import { useState, useEffect, useRef } from "react";
import useShelterData from "../api/ShelterData";
import ShelterItem from "../components/ShelterItem";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const ShelterList = () => {
  const nav = useNavigate();
  const { animals, error } = useShelterData();
  const [sortType, setSortType] = useState("name");
  const [search, setSearch] = useState("");
  const mapRef = useRef(null);
  const [dots, setDots] = useState("");

  const onChangeSortType = (e) => setSortType(e.target.value);
  const onChangeSearch = (e) => setSearch(e.target.value);

  const uniqueShelters = animals.filter((shelter, index, self) => {
    const key = `${shelter.SHTER_NM}-${shelter.PROTECT_PLC}`;
    return (
      index === self.findIndex((s) => `${s.SHTER_NM}-${s.PROTECT_PLC}` === key)
    );
  });

  const getSortedData = () => {
    return [...uniqueShelters].sort((a, b) => {
      if (sortType === "name") {
        return a.SHTER_NM.localeCompare(b.SHTER_NM);
      } else {
        return a.PROTECT_PLC.localeCompare(b.PROTECT_PLC);
      }
    });
  };

  const getFilteredData = () => {
    const filtered = getSortedData();
    if (!search) return filtered;
    return filtered.filter((item) =>
      item.SHTER_NM.toLowerCase().includes(search.toLowerCase())
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div>에러 발생</div>;
  if (!Array.isArray(animals)) return <div>불러오는 중...</div>;
  if (!animals.length) return <div className="load">로딩중{dots}</div>;

  return (
    <div className="ShelterList">
      <Header leftChild={true} />
      <div className="ShelterList-container inner">
        <div className="menu-title">
          <h3>보호소 목록</h3>
        </div>

        <div className="search-box">
          <select value={sortType} onChange={onChangeSortType}>
            <option value="name">이름순</option>
            <option value="place">주소순</option>
          </select>
          <input
            value={search}
            onChange={onChangeSearch}
            placeholder="보호소 이름 검색"
          />
          <Button text="조회" type="Square" />
        </div>

        <div className="ShelterItems">
          {getFilteredData().map((shelter) => (
            <ShelterItem
              key={shelter.SHTER_NM + shelter.PROTECT_PLC}
              {...shelter}
              onClick={() => {
                nav(`/shelter/${shelter.careRegNo}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelterList;
