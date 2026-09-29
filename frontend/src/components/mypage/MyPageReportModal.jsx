import { useModal } from "../../contexts/ModalContext";
import Dialog from "../ui/Dialog";
import StaticPointMap from "../ui/StaticPointMap";

/* 목격 제보 상세. 사진 자리에 제보된 위치 지도를 얹는다 */
const MyPageReportModal = ({ title, content, petReportPoint }) => {
  const { isActive, toggleModal } = useModal();

  if (!isActive) return null;

  return (
    <Dialog
      onClose={toggleModal}
      title={title}
      media={
        <div className="aspect-[16/10] w-full bg-brand-soft">
          {petReportPoint ? (
            <StaticPointMap point={petReportPoint} level={3} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-ink-muted">
              위치 정보가 없는 제보예요.
            </p>
          )}
        </div>
      }
    >
      <p className="text-sm leading-relaxed wrap-anywhere break-keep whitespace-pre-line text-ink-muted">
        {content}
      </p>
    </Dialog>
  );
};

export default MyPageReportModal;
