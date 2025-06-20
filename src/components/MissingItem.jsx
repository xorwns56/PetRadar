import "../style/MissingItem.css";
import { getMissingImage } from "../utils/get-missingPet-image";
import Button from "./Button";

const MissingItem = ({
  petId,
  petName,
  petType,
  petSex,
  petAge,
  petMissingDate,
  onClick,
}) => {
  return (
    <div className="MissingItem">
      <div className="MissingItem-img">
        <img src={getMissingImage(petId)} alt="missingPet img" />
      </div>

      <div className="contents">
        <div className="contents-t1">
          <p className="petType">{petType}</p>
          <p>{petSex}</p>
          <p>{petName}</p>
        </div>
        <p className="contents-t2">{petAge}(년생)</p>
        <div className="contents-t3">
          <p>실종일자 : {petMissingDate}</p>
          <Button text={"제보하기"} type={"Square_ls"} onClick={onClick} />
        </div>
      </div>
    </div>
  );
};
export default MissingItem;
