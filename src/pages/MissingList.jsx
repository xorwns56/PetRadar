import { useEffect, useState } from "react";
import { missingPet } from "../utils/missingPet";
import Button from "../components/Button";
import Header from "../components/Header";
import ListItem from "../components/ListItem";

const MissingList = () => {
  const [missigPetList, setMissingPetList] = useState(null);
  const [sortType, setSortType] = useState("latest");
  const onChangeSortType = (e) => {
    setSortType(e.target.value);
  };
  const getSortedData = (missingPet) => {
    return missingPet.toSorted((prev, next) => {
      if (sortType === "oldest") {
        return Number(prev.petMissingDate) - Number(next.petMissingDate);
      } else {
        return Number(next.petMissingDate) - Number(prev.petMissingDate);
      }
    });
  };
  const sortedData = getSortedData();

  return (
    <div>
      <Header leftChild={true} />
      <div>
        <select value={sortType} onChange={onChangeSortType}>
          <option value={"latest"}>최신순</option>
          <option value={"oldest"}>오래된 순</option>
        </select>
        <input placeholder="검색할 제목을 입력하세요." />
        <Button text={"조회하기"} />
      </div>
      <div>
        {sortedData.map((item) => (
          <ListItem key={item.id} {...item} />
        ))}
      </div>

      {missigPetList && (
        <Modal onClose={() => setMissingPetList(null)}>{missigPetList}</Modal>
      )}
    </div>
  );
};
export default MissingList;
