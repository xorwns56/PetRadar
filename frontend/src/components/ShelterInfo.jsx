import Dialog, { DialogField } from "./Dialog";

/* 지도의 표시를 눌렀을 때 뜨는 보호소 요약 */
const ShelterInfo = ({ shelter, onClose }) => {
  if (!shelter) return null;

  return (
    <Dialog onClose={onClose} title={shelter.SHTER_NM}>
      <DialogField
        label="주소"
        value={shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}
      />
      <DialogField label="전화번호" value={shelter.SHTER_TELNO} />
    </Dialog>
  );
};

export default ShelterInfo;
