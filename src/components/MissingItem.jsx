import "../style/MissingItem.css";
import { getMissingImage } from "../utils/get-missingPet-image";
import { useMissingState } from "../contexts/MissingContext";
import Button from "./Button";

const MissingItem = ({ petMissingId, onClick, toggleModal }) => {
  const missingList = useMissingState();

  const missingPet = missingList.find(
    (item) => String(item.petMissingId) === String(petMissingId)
  );

  const imageSrc = missingPet.petImage || "/image-default.png";

  const genderSymbol = {
    M: "♂",
    F: "♀",
  };

  return (
    <div className="MissingItem">
      <div className="MissingItem-img" onClick={toggleModal}>
        <img
          src={imageSrc}
          alt="missingPet img"
          onError={(e) => {
            e.target.onerror = null;
          }}
        />
      </div>
      <div className="contents" onClick={toggleModal}>
        <div className="contents-t1">
          <p className="petType">{missingPet.petType}</p>
          <p>{genderSymbol[missingPet.petGender] || "-"}</p>
          <p>{missingPet.petName}</p>
        </div>
        <p className="contents-t2">{missingPet.title}</p>
        <p>{missingPet.petAge}(년생)</p>
        <p>실종일자 : {missingPet.petMissingDate}</p>
      </div>
      <div className="ReportMove-btn">
        <Button text={"제보하기"} type={"Square_ls"} onClick={onClick} />
      </div>
    </div>
  );
};
export default MissingItem;
