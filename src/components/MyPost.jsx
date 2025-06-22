import { useEffect, useRef, useState } from "react";
import "../style/MyPost.css";
import Pagination from "./Pagination";
import MypageModalDetail from "./MypageModalDetail";
import { useModal } from "../hooks/ModalContext";
import MyPostReportItem from "./MyPostReportItem";
import MyPostMissingItem from "./MyPostMissingItem";
import { useMissingState } from "../contexts/MissingContext";
import { useReportState } from "../contexts/ReportContext";

const slice = (items, page, itemSize) => {
  const end = page * itemSize;
  const start = end - itemSize;
  return items.slice(start, end);
};

const MyPost = ({ id }) => {
  const { toggleModal } = useModal();
  const missingState = useMissingState();
  const reportState = useReportState();
  const myMissing = missingState
    .filter((item) => {
      return item.id === id;
    })
    .toSorted((prev, next) => {
      return next.createDate - prev.createDate;
    });
  const [petMissingId, setPetMissingId] = useState(
    myMissing.length > 0 ? myMissing[0].petMissingId : null
  );
  useEffect(() => {
    setPage(1);
  }, [petMissingId]);
  const missingReport = reportState
    .filter((item) => {
      return String(item.petMissingId) === String(petMissingId);
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
        <h3>제보글 목록</h3>
      </div>
      <div className="post-content">
        <div className="missing">
          {myMissing.map((item) => {
            return (
              <MyPostMissingItem
                key={`petMissing${item.petMissingId}`}
                petName={item.petName}
                isActive={item.petMissingId === petMissingId}
                onClick={() => setPetMissingId(item.petMissingId)}
              />
            );
          })}
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
                  console.log(item);
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
      </div>
      <MypageModalDetail {...modalData} />
    </div>
  );
};
export default MyPost;
