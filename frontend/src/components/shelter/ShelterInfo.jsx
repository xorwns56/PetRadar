import Dialog, { DialogField } from "../ui/Dialog";

/**
 * 보호소 상세.
 *
 * 예전에는 지도 마커용(ShelterInfo)과 카드용(ShelterModalDetail) 두 개가
 * 따로 있었는데 둘 다 이름·주소·전화만 보여줘서 하나로 합쳤다.
 */
const ShelterInfo = ({ shelter, onClose, onViewAnimals }) => {
  if (!shelter) return null;

  return (
    <Dialog onClose={onClose} withMedia={false} title={shelter.name}>
      <DialogField label="주소" value={shelter.address} />
      <DialogField label="전화번호" value={shelter.tel} />
      <DialogField label="관할" value={shelter.orgNm} />
      <DialogField label="보호 대상" value={shelter.saveTargetAnimal} />
      {shelter.openTime && (
        <DialogField
          label="운영시간"
          value={`${shelter.openTime} ~ ${shelter.closeTime}`}
        />
      )}
      <DialogField label="휴무일" value={shelter.closeDay} />
      <DialogField label="보호 중" value={`${shelter.animalCount}마리`} />

      {onViewAnimals && (
        <button
          type="button"
          onClick={() => onViewAnimals(shelter)}
          className="mt-4 w-full cursor-pointer rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          보호동물 보기
        </button>
      )}
    </Dialog>
  );
};

export default ShelterInfo;
