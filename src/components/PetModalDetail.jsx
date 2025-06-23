import "../style/ModalDetail.css";
import { useModal } from "../hooks/ModalContext";
import { getMissingImage } from "../utils/get-missingPet-image";
import { useMissingState } from "../contexts/MissingContext";
import Button from "./Button";

const ModalDetail = ({ selectedId, onClick }) => {
  const { isActive, toggleModal } = useModal();
  const missingList = useMissingState();

  const missingPet = missingList.find(
    (item) => String(item.petMissingId) === String(selectedId)
  );

  const imageSrc = missingPet.petImage || "/image-default.png";

  const genderSymbol = {
    M: "♂",
    F: "♀",
  };

  return (
    <div className={`ModalDetail ${isActive ? "active" : ""}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="img-box">
            <img src={imageSrc} alt="missingPet img" />
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <h3 className="petType">{missingPet.petType}</h3>
              <h3>{genderSymbol[missingPet.petGender] || "-"}</h3>
              <h3>{missingPet.petName}</h3>
            </div>
            <div className="contents-t2">
              <h3>나이</h3>
              <p>{missingPet.petAge}(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>실종날짜 </h3>
              <p>{missingPet.petMissingDate}</p>
            </div>
            <div className="contents-t4">
              <h3>내용</h3>
              <p>{missingPet.content}</p>
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
