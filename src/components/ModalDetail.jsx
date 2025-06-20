import { useModal } from "../hooks/ModalContext";
import "../style/ModalDetail.css";
import Button from "./Button";
import { missingPet } from "../utils/missingPet";

const ModalDetail = ({ onClick, selectedId }) => {
  const { isActive, toggleModal } = useModal();

  return (
    <div className={`ModalDetail ${isActive ? "active" : ""}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="img-box">
            {/* 이미지  or 위치 */}
            <img src="/dog.jpg" alt="" />
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <p className="petType">고양이</p>
              <p>♂</p>
              <p>코슈</p>
            </div>
            <div className="contents-t2">
              <h3>나이: </h3>
              <p>2022(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>실종날짜: </h3>
              <p>2025.06.19 실종</p>
            </div>
            <div className="contents-t4">
              <h3>특징: </h3>
              <p>내용</p>
            </div>
          </div>
          <div className="Report-btn">
            <Button text={"제보하기"} type={"Square_D"} onClick={onClick} />
          </div>
        </div>
        <div className="Modal-btn" onClick={toggleModal}>
          <Button text={"X"} type={"Circle"} />
        </div>
      </div>
    </div>
  );
};
export default ModalDetail;
