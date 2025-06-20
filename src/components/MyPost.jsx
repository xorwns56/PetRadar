import { useRef, useState } from "react";
import "../style/MyPost.css";
import Pagination from "./Pagination";
import Modal from "./Modal";
const MyPost = () => {
  const mockData = [{}, {}, {}, {}];

  const mockData2 = [{}, {}];

  const currPage = 1;
  const pageItemSize = 4;

  const [showModal, setShowModal] = useState(false);

  const rangeStart = (currPage - 1) * pageItemSize;
  const pagingData = mockData2.slice(rangeStart, pageItemSize);

  return (
    <div className="MyPost">
      <h2 className="title">제보 현황</h2>
      <div className="content">
        <div className="btn">
          {mockData.map((item, index) => {
            return <button key={index}>동물</button>;
          })}
        </div>
        <div className="report">
          {pagingData.map((item, index) => {
            return (
              <div
                onClick={() => setShowModal(true)}
                key={index}
                className="item"
              >
                <div className="img">
                  <img src="https://search.pstatic.net/common?type=f&size=174x174&quality=95&direct=true&src=http%3A%2F%2Fsstatic.naver.net%2Fkeypage%2Fimage%2Fdss%2F605%2F84%2F69%2F19%2F605_11846919_kind_imgurl_1_1579514278263.png" />
                </div>
                <div className="txt">
                  <h4>고양이를 발견했어요!!</h4>
                  <p>ㅇㅇㅇㅇ</p>
                  <p>ㅇㅇㅇㅇ</p>
                </div>
              </div>
            );
          })}
        </div>
        <Pagination />
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div>Modal</div>
        </Modal>
      )}
    </div>
  );
};
export default MyPost;
