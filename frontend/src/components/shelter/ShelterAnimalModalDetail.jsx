import Dialog, { DialogField } from "../ui/Dialog";
import { formatPublicDate, formatSex } from "../../utils/shelter-label";

/* 보호소 유기동물 상세 */
const ShelterAnimalModalDetail = ({ animal, onClose }) => {
  if (!animal) return null;

  return (
    <Dialog onClose={onClose} image={animal.imageUrl} badge={animal.kindType}>
      <DialogField label="품종" value={animal.breed} />
      <DialogField label="색상" value={animal.color} />
      <DialogField label="나이" value={animal.age} />
      <DialogField label="성별" value={formatSex(animal.sex)} />
      <DialogField label="몸무게" value={animal.weight} />
      <DialogField label="특징" value={animal.specialMark} />

      {/* 발견 지역은 관할 지자체다. 발견 지점의 좌표는 공공 API에 없다 */}
      <DialogField label="발견 지역" value={animal.orgNm} />
      <DialogField label="발견 장소" value={animal.foundPlace} />
      <DialogField label="발견일" value={formatPublicDate(animal.foundDate)} />

      {/* 공고가 끝나면 처리가 달라질 수 있어 기간을 함께 보여준다 */}
      <DialogField
        label="공고 기간"
        value={
          animal.noticeStartDate &&
          `${formatPublicDate(animal.noticeStartDate)} ~ ${formatPublicDate(
            animal.noticeEndDate
          )}`
        }
      />

      <DialogField label="보호소" value={animal.careName} />
      <DialogField label="보호소 위치" value={animal.careAddress} />
      <DialogField label="보호소 전화번호" value={animal.careTel} />
    </Dialog>
  );
};

export default ShelterAnimalModalDetail;
