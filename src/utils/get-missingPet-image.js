import petId_1 from "../../public/petId_1.jpg";
import petId_2 from "../../public/petId_2.jpg";
import petId_3 from "../../public/petId_3.jpg";

export function getMissingImage(missingPetId) {
  switch (missingPetId) {
    case 1:
      return petId_1;
    case 2:
      return petId_2;
    case 3:
      return petId_3;
    default:
      return null;
  }
}
