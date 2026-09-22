import { cn } from "../../utils/cn";

/* 내가 신고한 아이들 중 하나를 고르는 알약 버튼 */
const MyPostMissingItem = ({ isActive, petName, onClick }) => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={onClick}
    className={cn(
      "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      isActive
        ? "border-brand bg-brand text-white"
        : "border-line bg-surface text-ink-muted hover:border-brand hover:text-brand"
    )}
  >
    {petName}
  </button>
);

export default MyPostMissingItem;
