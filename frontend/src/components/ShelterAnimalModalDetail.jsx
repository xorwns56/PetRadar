import Dialog, { DialogField } from "./Dialog";

/* 보호소 유기동물 상세 */
const ShelterAnimalModalDetail = ({ animal, onClose }) => {
  if (!animal) return null;

  return (
    <Dialog
      onClose={onClose}
      image={animal.IMAGE_COURS}
      badge={animal.SPECIES_NM}
    >
      <DialogField label="색상" value={animal.COLOR_NM} />
      <DialogField label="나이" value={animal.AGE_INFO} />
      <DialogField label="특이사항" value={animal.SFETR_INFO} />
      <DialogField label="보호소 위치" value={animal.PROTECT_PLC} />
      <DialogField label="보호소 전화번호" value={animal.SHTER_TELNO} />
    </Dialog>
  );
};

export default ShelterAnimalModalDetail;
