import { useEffect, useRef, useState } from "react";
import "../style/MyPost.css";
import Pagination from "./Pagination";
import Modal from "./Modal";
import MypageModalDetail from "./MypageModalDetail";
import { useModal } from "../hooks/ModalContext";
const MyPost = () => {
  const { toggleModal } = useModal();
  const mockData = [
    { petMissingId: 0, petName: "코카스패니얼" },
    { petMissingId: 1, petName: "코슈" },
    { petMissingId: 2, petName: "코슈" },
    { petMissingId: 3, petName: "코슈" },
  ];
  const mockData2 = [
    { petReportId: 0 },
    { petReportId: 1 },
    { petReportId: 2 },
  ];

  const reportDiv = useRef(null);
  const itemDiv = useRef(null);

  const [itemCount, setItemCount] = useState(5);

  useEffect(() => {
    const calcItemSize = () => {
      if (reportDiv.current && itemDiv.current) {
        const reportHeight = reportDiv.current.clientHeight;
        const itemHeight = itemDiv.current.clientHeight;
        const size = Math.floor(reportHeight / itemHeight);
        setItemCount(size > 0 ? size : 1); // 최소 1
      }
    };

    calcItemSize();
    window.addEventListener("resize", calcItemSize);
    return () => window.removeEventListener("resize", calcItemSize);
  }, []);

  console.log(itemCount);

  const [petMissingId, setPetMissingId] = useState(
    mockData.length > 0 ? mockData[0].petMissingId : null
  );
  const itemSize = 1;
  const [sliceItems, setSliceItems] = useState(mockData2.slice(0, itemSize));
  const onClick = (page) => {
    const end = page * itemSize;
    const start = end - itemSize;
    setSliceItems(mockData2.slice(start, end));
  };
  return (
    <div className="MyPost">
      <h2 className="title">제보글</h2>
      <div className="content">
        <div className="tabs">
          {mockData.map((item) => {
            return (
              <button
                className={`tab ${
                  item.petMissingId === petMissingId ? "active" : ""
                }`}
                key={`petMissing${item.petMissingId}`}
                onClick={() => setPetMissingId(item.petMissingId)}
              >
                #{item.petName}
              </button>
            );
          })}
        </div>
        <div className="report" ref={reportDiv}>
          {sliceItems.map((item, index) => {
            return (
              <div
                ref={index === 0 ? itemDiv : null}
                onClick={toggleModal}
                key={`petReport${item.petReportId}`}
                className="item"
              >
                <div className="post-thumbnail">
                  <img src="https://search.pstatic.net/common?type=f&size=174x174&quality=95&direct=true&src=http%3A%2F%2Fsstatic.naver.net%2Fkeypage%2Fimage%2Fdss%2F605%2F84%2F69%2F19%2F605_11846919_kind_imgurl_1_1579514278263.png" />
                </div>
                <div className="post-info">
                  <p className="post-title">aasd</p>
                  <p className="post-description">
                    당곡역 근처에서 하얀색 고양이가 포착되었습니다. 정확한
                    장소는
                  </p>
                  <p className="post-location">위치보기</p>
                </div>
              </div>
            );
          })}
        </div>
        <Pagination
          totalItems={mockData2.length}
          onClick={onClick}
          itemSize={itemSize}
        />
      </div>
      <MypageModalDetail />
    </div>
  );
};
export default MyPost;
