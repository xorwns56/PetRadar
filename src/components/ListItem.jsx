import { useState } from "react";
import { getMissingImage } from "../utils/get-missingPet-image";
import { missingPet } from "../utils/missingPet";
import Button from "./Button";
import Modal from "./Modal";

const ListItem = ({ id, name, content }) => {
  const [modalPop, setModalPop] = useState(false);

  return (
    <div style={{ border: "1px solid black", display: "flex" }}>
      {/* missingPet img */}
      <div style={{ border: "1px solid black" }}>
        <img src={getMissingImage(id)} alt="missingPet img" />
      </div>
      {/* missingPet content */}
      <div>
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
