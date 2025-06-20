import { useModal } from "../hooks/ModalContext";
import "../style/ModalDetail.css";
import { getMissingImage } from "../utils/get-missingPet-image";
import { missingPet } from "../utils/missingPet";
import Button from "./Button";

const ModalDetail = ({
  petId,
  petName,
  petType,
  petGender,
  petAge,
  petMissingDate,
  onClick,
}) => {
  const { isActive, toggleModal } = useModal();

  return (
    <div className={`ModalDetail ${isActive ? "active" : ""}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="img-box">
            {/* 이미지  or 위치 */}
            <img src={getMissingImage(petId)} alt="missingPet img" />
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <p className="petType">{petType}</p>
              <p>{petGender}</p>
              <p>{petName}</p>
            </div>
            <div className="contents-t2">
              <h3>나이: {petAge}</h3>
              <p>2022(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>실종날짜: </h3>
              <p>{petMissingDate} 실종</p>
            </div>
            <div className="contents-t4">
              <h3>특징: </h3>
              <p>관악구 도림천 근처에 비슷한 애 본 것 같아요.</p>
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
