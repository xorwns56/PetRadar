import "../style/MissingList.css";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import MissingItem from "../components/MissingItem";
import PetModalDetail from "../components/PetModalDetail";
import { useNavigate } from "react-router-dom";
import { useModal } from "../hooks/ModalContext";
import { useAuth } from '../contexts/AuthContext';

const MissingList = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const { toggleModal } = useModal();
  const nav = useNavigate();
  const { api, userId } = useAuth();
  const [sortType, setSortType] = useState("latest");
  const onChangeSortType = (e) => {
    setSortType(e.target.value);
  };
  const [missingList, setMissingList] = useState([]);
  useEffect(() => {
      // missing list 데이터 가져오기
      const fetchMissingList = async () => {
        try {
          const response = await api.get("/api/missing", {
            params: {
                page: 0,
                size: 5,
                sort: "createdAt,desc"
            }
          });
          setMissingList(response.data);
        } catch (error) {
          console.error("Failed to fetch missing list:", error);
        }
      };
      fetchMissingList();
    }, []); // 빈 배열을 넣어 컴포넌트가 처음 렌더링될 때만 실행


  const getSortedList = () => {
    return missingList.toSorted((prev, next) => {
      if (sortType === "oldest") {
        return prev.createDate - next.createDate;
      } else {
        return next.createDate - prev.createDate;
      }
    });
  };
  const sortedList = getSortedList();

  const [searchInput, setSearchInput] = useState("");
  const [searchBtn, setSearchBtn] = useState("");

  const onChangeInput = (e) => {
    setSearchInput(e.target.value);
  };
  const onClickChange = () => {
    setSearchBtn(searchInput);
  };

  const getFilterTitle = () => {
    if (searchInput === "") {
      return sortedList;
    }
    return sortedList.filter((item) =>
      item.title?.toLowerCase().includes(searchBtn.toLowerCase())
    );
  };
  const getFilterTitleData = getFilterTitle();

  return (
    <div className="MissingList">
      <Header leftChild={true} />
      <div className="MissingList-container inner">
        <div className="PageTitle">
          <h3>실종 동물 목록</h3>
        </div>
        {/* search-box */}
        <div className="search-box">
          <select value={sortType} onChange={onChangeSortType}>
            <option value={"latest"}>최신순</option>
            <option value={"oldest"}>오래된 순</option>
          </select>
          <input
            value={searchInput}
            onChange={onChangeInput}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     onClickChange();
            //   }
            // }}
            placeholder="검색할 제목을 입력하세요."
          />
          <Button text={"조회"} type={"Square"} onClick={onClickChange} />
        </div>
        {/* "MissingItems */}
        <div className="MissingItems">
          {getFilterTitleData.map((item) => (
            <MissingItem
              key={item.id}
              missingDTO={item}
              toggleModal={() => {
                setSelectedItem(item);
                toggleModal();
              }}
              onClick={() => {
                nav(`/missingReport/${item.id}`);
              }}
              myMissing={userId === item.userId}
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

      {selectedItem && (
        <PetModalDetail
          selectedId={selectedItem.petMissingId}
          onClick={() => {
            nav(`/missingReport/${selectedItem.petMissingId}}`);
          }}
          myMissing={userState.currentUser === selectedItem.id}
        />
      )}
    </div>
  );
};
export default MissingList;
