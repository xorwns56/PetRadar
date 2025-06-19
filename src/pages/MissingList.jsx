import { useState } from "react";
import { missingPet } from "../utils/missingPet";
import Button from "../components/Button";
import Header from "../components/Header";
import MissingItem from "../components/MissingItem";

const MissingList = () => {
  const [selectedMissingPet, setSelectedMissingPet] = useState(null);
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
    return sortedData.filter((title) =>
      title.petTitle.toLowerCase().includes(search.toLowerCase())
    );
  };
  const getFilterTitleData = getFilterTitle();

  return (
    <div>
      <Header leftChild={true} />
      <div>
        <select value={sortType} onChange={onChangeSortType}>
          <option value={"latest"}>최신순</option>
          <option value={"oldest"}>오래된 순</option>
        </select>
        <input
          value={search}
          onChange={onChangeSearch}
          placeholder="검색할 제목을 입력하세요."
        />
        <Button text={"조회하기"} />
      </div>
      <div>
        {getFilterTitleData.map((item) => (
          <MissingItem key={item.id} {...item} />
        ))}
      </div>
      {selectedMissingPet && (
        <Modal onClose={() => setSelectedMissingPet(null)}>
          {selectedMissingPet}
        </Modal>
      )}
      <Button text={"실종 동물 신고"} />
    </div>
  );
};
export default MissingList;
