import { getMissingImage } from "../utils/get-missingPet-image";
import Button from "./Button";

const MissingItem = ({
  petId,
  petName,
  petType,
  petSex,
  petAge,
  petMissingDate,
}) => {
  return (
    <div style={{ border: "1px solid black", display: "flex" }}>
      {/* missingPet img */}
      <div style={{ border: "1px solid black" }}>
        <img src={getMissingImage(petId)} alt="missingPet img" />
      </div>
      {/* missingPet content */}
      <div>
        <div>{petType}</div>
        <div>{petSex}</div>
        <div>{petName}</div>
        <div>{petAge}(년생)</div>
        <div>실종일자 : {petMissingDate}</div>
      </div>
      <div>
        <Button text={"제보하기"} />
      </div>
    </div>
  );
};
export default MissingItem;
