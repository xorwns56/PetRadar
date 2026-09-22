import { cn } from "../../utils/cn";

/* 라벨이 입력칸 안에 있다가 값이 들어오면 위로 올라가는 입력칸.
   로그인·회원가입이 쓰던 모양을 유지하되, focus 상태를 state로 들고 있지
   않는다 — 포커스는 CSS(peer-focus)가, 값 여부만 floated가 판단한다.

   오류 문구는 입력칸 바로 아래에 붙인다. 예전 회원가입은 세 필드의 오류를
   폼 맨 아래에 몰아 보여줘서 어느 칸이 틀렸는지 알기 어려웠다. */
const FloatingField = ({
  id,
  label,
  value,
  error,
  trailing,
  className,
  ...inputProps
}) => {
  const floated = Boolean(value);

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          value={value}
          /* 라벨이 자리를 차지하므로 브라우저 기본 placeholder는 비워 둔다 */
          placeholder=" "
          className={cn(
            "peer h-14 w-full rounded-xl border bg-surface px-4 pt-6 pb-1.5 text-sm text-ink",
            "transition-colors focus:outline-none",
            error
              ? "border-danger focus:border-danger"
              : "border-line focus:border-brand",
            trailing && "pr-20"
          )}
          {...inputProps}
        />

        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 text-ink-muted transition-all duration-150",
            floated ? "top-2 text-xs font-semibold" : "top-4 text-sm",
            // 변형 선택자가 우선순위가 높아 포커스 중에는 항상 올라간다
            "peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand"
          )}
        >
          {label}
        </label>

        {trailing && (
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
            {trailing}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 px-1 text-xs leading-relaxed font-semibold break-keep text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

/* 입력칸 안 오른쪽의 작은 아이콘 버튼(지우기·비밀번호 보기) */
export const FieldIconButton = ({ label, icon, onClick }) => (
  <button
    type="button"
    tabIndex={-1}
    aria-label={label}
    onClick={onClick}
    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5"
  >
    <img src={icon} alt="" className="size-4" />
  </button>
);

export default FloatingField;
