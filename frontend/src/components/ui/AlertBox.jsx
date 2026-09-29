/* 알림 한 건의 생김새. 실종 알림과 제보 알림이 문구만 다르고
   구조는 같아서 한 컴포넌트로 합쳤다 */
const AlertBox = ({ icon, thumbnail, title, description, onAlertClick, onAlertClose }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand/40 bg-surface p-4 shadow-card">
      <button
        type="button"
        onClick={onAlertClick}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {/* 보호소 알림처럼 보여줄 사진이 있으면 이모지 대신 쓴다.
            실종자가 가장 빨리 판단하는 건 사진이라, 눌러 들어가지 않고도
            아닌 것을 걸러낼 수 있어야 한다 */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/image-default.png";
            }}
            className="size-14 shrink-0 rounded-xl bg-brand-soft object-cover"
          />
        ) : (
          <span aria-hidden="true" className="text-xl leading-none">
            {icon}
          </span>
        )}
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
