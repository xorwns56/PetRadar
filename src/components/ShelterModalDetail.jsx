import { getMissingImage } from "../utils/get-missingPet-image";
import { useModal } from "../hooks/ModalContext";

const ShelterModalDetail = ({ onClick, animal }) => {
  const { isActive, toggleModal } = useModal();
  if (!animal) return null;

  return (
    <div className={`ModalDetail ${isActive ? "active" : ""}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="img-box">
            <img src={getMissingImage(animal.petId)} alt="동물 이미지" />
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <p className="petType">{animal.petType}</p>
              <p>{animal.petGender}</p>
              <p>{animal.petName}</p>
            </div>
            <div className="contents-t2">
              <h3>나이:</h3>
              <p>{animal.petAge}(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>실종날짜:</h3>
              <p>{animal.petMissingDate}</p>
            </div>
            <div className="contents-t4">
              <h3>특징:</h3>
              <p>{animal.petDescription || "설명 없음"}</p>
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

export default ShelterModalDetail;
