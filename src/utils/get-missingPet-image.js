import 마루 from "../../public/마루.jpg";
import 코쇼 from "../../public/코쇼.jpg";
import 히니 from "../../public/히니.jpg";

export function getMissingImage(missingPetId) {
  switch (missingPetId) {
    case 1:
      return 마루;
    case 2:
      return 코쇼;
    case 3:
      return 히니;
    default:
      return null;
  }
}
