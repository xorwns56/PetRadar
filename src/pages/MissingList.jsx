import "../style/MissingList.css";
import { useState } from "react";
import { missingPet } from "../utils/missingPet";
import Button from "../components/Button";
import Header from "../components/Header";
import MissingItem from "../components/MissingItem";

import ModalDetail from "../components/ModalDetail";
import { useNavigate } from "react-router-dom";
import { useModal } from "../hooks/ModalContext";

const MissingList = () => {
  const [selectedId, setSelectedId] = useState(null);
  const { toggleModal } = useModal();
  const nav = useNavigate();

  const [sortType, setSortType] = useState("latest");
  const onChangeSortType = (e) => {
    setSortType(e.target.value);
  };

  const getSortedData = () => {
    return [...missingPet].toSorted((prev, next) => {
      const prevDate = new Date(prev.petMissingDate);
      const nextDate = new Date(next.petMissingDate);
      if (sortType === "oldest") {
        return prevDate - nextDate;
      } else {
        return nextDate - prevDate;
      }
    });
  };
  const sortedData = getSortedData();

  const [search, setSearch] = useState("");
  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };
  const getFilterTitle = () => {
    if (search === "") {
      return sortedData;
    }
    return sortedData.filter((item) =>
      item.petTitle.toLowerCase().includes(search.toLowerCase())
    );
  };
  const getFilterTitleData = getFilterTitle();

  return (
    <div className="MissingList">
      <Header leftChild={true} />
      <div className="MissingList-conatiner inner">
        <div className="menu-title">
          <h3>실종동물 목록</h3>
        </div>
        {/* search-box */}
        <div className="search-box">
          <select value={sortType} onChange={onChangeSortType}>
            <option value={"latest"}>최신순</option>
            <option value={"oldest"}>오래된 순</option>
          </select>
          <input
            value={search}
            onChange={onChangeSearch}
            placeholder="검색할 제목을 입력하세요."
          />
          <Button text={"조회"} type={"Square"} />
        </div>
        {/* "MissingItems */}
        <div className="MissingItems">
          {getFilterTitleData.map((item) => (
            <MissingItem
              key={item.petId}
              {...item}
              toggleModal={() => {
                setSelectedId(item.petId);
                toggleModal();
              }}
              onClick={() => {
                nav("/missingReport");
              }}
            />
          ))}
        </div>

        <div className="MissingList-btn">
          <Button
            text={"실종 동물 신고"}
            type={"Square_lg"}
            onClick={() => {
              nav("/missingDeclaration");
            }}
          />
        </div>
      </div>
      <ModalDetail
        selectedId={selectedId}
        onClick={() => {
          nav("/missingReport");
        }}
      />
    </div>
  );
};
export default MissingList;
