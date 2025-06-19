import { useState } from "react";
import { getMissingImage } from "../utils/get-missingPet-image";
import { missingPet } from "../utils/missingPet";
import Button from "./Button";

const ListItem = ({ missingPetId }) => {
  const [modalPop, setModalPop] = useState(false);
  const openModal = () => {
    setModalPop(true);
  };
  const closeModal = () => {
    setModalPop(false);
  };

  return (
    <div style={{ border: "1px solid black", display: "flex" }}>
      {/* missingPet img */}
      <div onClick={openModal} style={{ border: "1px solid black" }}>
        <img src={getMissingImage(missingPetId)} alt="missingPet img" />
      </div>
      {/* missingPet content */}
      <div onClick={closeModal}>
        <div>{}</div>
        <div>내용</div>
      </div>
      <div>
        <Button />
      </div>
    </div>
  );
};
export default ListItem;
