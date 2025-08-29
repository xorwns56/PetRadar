import "../style/MyPost.css";
import { useEffect, useState } from "react";
import Pagination from "./Pagination";
import MypageModalDetail from "./MypageModalDetail";
import { useModal } from "../hooks/ModalContext";
import MyPostReportItem from "./MyPostReportItem";
import MyPostMissingItem from "./MyPostMissingItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const slice = (items, page, itemSize) => {
  const end = page * itemSize;
  const start = end - itemSize;
  return items.slice(start, end);
};

const MyPost = ({ id }) => {
  const nav = useNavigate();
  const { isActive, toggleModal } = useModal();
    const { api } = useAuth();
  const { myMissing, setMyMissing } = useState();
  /*
  const myMissing = missingState
    .filter((item) => {
      return item.id === id;
    })
    .toSorted((prev, next) => {
      return next.createDate - prev.createDate;
    });

   */
  const [petMissingItem, setPetMissingItem] = useState(
    myMissing.length > 0 ? myMissing[0] : null
  );




  useEffect(() => {
    if (isActive) toggleModal();

      const fetchMyMissing = async () => {
          try {
              const response = await api.get("/api/missing/me");
                console.log(response.data);
              /*
              setUserInfo({
                  id : response.data.loginId,
                  hp : response.data.hp
              });
               */
          } catch (error) {
              console.error("Failed to fetch missing:", error);
          }
      };
      fetchMyMissing();

  }, []);
  useEffect(() => {
    setPage(1);
    if (!petMissingItem && myMissing.length > 0) {
      setPetMissingItem(myMissing[0]);
    }
  }, [petMissingItem]);
  const missingReport = reportState
    .filter((item) => {
      return (
        petMissingItem &&
        String(item.petMissingId) === String(petMissingItem.petMissingId)
      );
    })
    .toSorted((prev, next) => {
      return next.createDate - prev.createDate;
    });
  const [page, setPage] = useState(1);
  const itemSize = 2;
  const sliceItems = slice(missingReport, page, itemSize);
  const onPageClick = (page) => setPage(page);
  const [modalData, setModalData] = useState({});
  return (
    <div className="MyPost">
      <div className="post-title">
        <h3>나의 실종신고</h3>
      </div>
      <div className="post-content">
        <div className="none-text">
          <p>현재 실종신고가 존재하지 않습니다.</p>
        </div>
        {petMissingItem && (
          <>
            <div className="missing">
              {myMissing.map((item) => {
                return (
                  <MyPostMissingItem
                    key={`petMissing${item.petMissingId}`}
                    petName={item.petName}
                    isActive={item.petMissingId === petMissingItem.petMissingId}
                    onClick={() => setPetMissingItem(item)}
                  />
                );
              })}
            </div>
            <div className="MyPostMissingList">
              <div className="MyPostMissingList-container">
                <div className="title">
                  <p>{petMissingItem.title}</p>
                </div>
              </div>
              <div className="btn">
                <p
                  onClick={() => {
                    nav(`/missingRevise/${petMissingItem.petMissingId}`);
                  }}
                >
                  수정
                </p>
                <span>|</span>
                <p
                  onClick={() => {
                    if (
                      confirm(
                        `${petMissingItem.petName}의 실종신고를 정말 삭제하시겠습니까?`
                      )
                    ) {
                      missingDispatch({
                        type: "DELETE",
                        data: { petMissingId: petMissingItem.petMissingId },
                      });
                      reportDispatch({
                        type: "DELETE_BY_MISSING",
                        data: { petMissingId: petMissingItem.petMissingId },
                      });
                      setPetMissingItem(null);
                    }
                  }}
                >
                  삭제
                </p>
              </div>
            </div>
            <div className="report">
              {sliceItems.map((item) => {
                return (
                  <MyPostReportItem
                    key={`petReport${item.petReportId}`}
                    title={item.title}
                    content={item.content}
                    petImage={item.petImage}
                    onClick={() => {
                      setModalData(item);
                      toggleModal();
                    }}
                  />
                );
              })}
            </div>
            <Pagination
              totalItems={missingReport.length}
              page={page}
              onClick={onPageClick}
              itemSize={itemSize}
            />
          </>
        )}
      </div>
      <MypageModalDetail {...modalData} />
    </div>
  );
};
export default MyPost;
