import { useModal } from "../../contexts/ModalContext";
import Button from "../ui/Button";
import Dialog, { DialogField } from "../ui/Dialog";
import { petTypeLabel, petGenderLabel } from "../../utils/pet-label";

/* 실종 동물 상세 모달 */
const PetModalDetail = ({ missingPet, onClick, myMissing }) => {
  const { isActive, toggleModal } = useModal();

  if (!isActive) return null;

  return (
    <Dialog
      onClose={toggleModal}
      image={missingPet.petImage}
      badge={petTypeLabel(missingPet.petType)}
      title={missingPet.petName}
      footer={
        !myMissing && (
          <Button size="lg" className="w-full" onClick={onClick}>
            제보하기
          </Button>
        )
      }
    >
      {/* 성별·나이·실종일은 짧아서 줄마다 쌓기보다 한 줄에 놓는 편이 읽기 쉽다 */}
      <dl className="grid grid-cols-3 gap-3 rounded-xl bg-page p-3 text-center">
        <div>
          <dt className="text-xs text-ink-muted">성별</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {petGenderLabel(missingPet.petGender)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">나이</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {missingPet.petAge}년생
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">실종일</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {missingPet.petMissingDate}
          </dd>
        </div>
      </dl>

      <DialogField label="제목" value={missingPet.title} />
      <DialogField label="내용" value={missingPet.content} />
    </Dialog>
  );
};

export default PetModalDetail;
