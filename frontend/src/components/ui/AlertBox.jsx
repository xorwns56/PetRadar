/* 알림 한 건의 생김새. 실종 알림과 제보 알림이 문구만 다르고
   구조는 같아서 한 컴포넌트로 합쳤다 */
const AlertBox = ({ icon, title, description, onAlertClick, onAlertClose }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand/40 bg-surface p-4 shadow-card">
      <button
        type="button"
        onClick={onAlertClick}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-snug font-semibold text-ink">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
            {description}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label="알림 지우기"
        onClick={onAlertClose}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        ✕
      </button>
    </div>
  );
};

export default AlertBox;
