import Dialog, { DialogField } from "./Dialog";

/* 보호소 카드를 눌렀을 때 뜨는 상세 */
const ShelterModalDetail = ({ animal, onClose }) => {
  if (!animal) return null;

  return (
    <Dialog onClose={onClose} title={animal.SHTER_NM}>
      <DialogField label="주소" value={animal.PROTECT_PLC} />
      <DialogField label="전화번호" value={animal.SHTER_TELNO} />
    </Dialog>
  );
};

export default ShelterModalDetail;
