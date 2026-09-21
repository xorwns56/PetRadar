import Button from "../Button";

/* 로딩 실패·빈 결과를 같은 모양으로 보여준다.
   예전 ShelterList의 에러 화면은 헤더도 없이 글자만 떠서
   어디에서 무엇이 실패했는지 알 수 없었다 */
const StateNotice = ({ message, actionText, onAction }) => (
  <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center shadow-card">
    <img src="/Menu-icon1.png" alt="" className="mx-auto w-32 opacity-80" />
    <p className="mt-4 text-sm leading-relaxed break-keep text-ink-muted">
      {message}
    </p>
    {actionText && (
      <Button variant="secondary" className="mt-5" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export default StateNotice;
