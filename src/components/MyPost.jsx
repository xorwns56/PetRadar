import { useEffect, useRef, useState } from "react";
import "../style/MyPost.css";
import Pagination from "./Pagination";
import MypageModalDetail from "./MypageModalDetail";
import { useModal } from "../hooks/ModalContext";
import MyPostReportItem from "./MyPostReportItem";
import MyPostMissingItem from "./MyPostMissingItem";
import {
  useMissingDispatch,
  useMissingState,
} from "../contexts/MissingContext";
import { useReportDispatch, useReportState } from "../contexts/ReportContext";
import { useNavigate } from "react-router-dom";

const slice = (items, page, itemSize) => {
  const end = page * itemSize;
  const start = end - itemSize;
  return items.slice(start, end);
};

const MyPost = ({ id }) => {
  const nav = useNavigate();
  const { isActive, toggleModal } = useModal();
  const missingState = useMissingState();
  const missingDispatch = useMissingDispatch();
  const reportState = useReportState();
  const reportDispatch = useReportDispatch();
  const myMissing = missingState
    .filter((item) => {
      return item.id === id;
    })
    .toSorted((prev, next) => {
      return next.createDate - prev.createDate;
    });
  const [petMissingItem, setPetMissingItem] = useState(
    myMissing.length > 0 ? myMissing[0] : null
  );
  useEffect(() => {
    if (isActive) toggleModal();
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <p>{petMissingItem.title}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <p
                  onClick={() => {
                    nav(`/missingRevise/${petMissingItem.petMissingId}`);
                  }}
                >
                  수정
                </p>
                <p>|</p>
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
