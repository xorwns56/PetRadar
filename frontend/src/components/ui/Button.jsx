import { cn } from "../../utils/cn";

/* 버튼 모양은 여기서만 정한다.
   예전에는 Button.css의 Button_Square_ls / _lg / _lc / _D 같은 이름이
   크기와 색을 한꺼번에 뜻해서, 새 조합이 필요할 때마다 클래스가 늘어났다.
   색(variant)과 크기(size)를 나눠 조합으로 만든다. */
const VARIANTS = {
  primary:
    "bg-brand text-white hover:bg-brand-strong active:bg-brand-strong shadow-sm",
  secondary:
    "bg-surface text-ink border border-line hover:border-brand hover:text-brand",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand/20",
  ghost: "text-ink-muted hover:bg-black/5 hover:text-ink",
  danger: "bg-surface text-danger border border-danger/30 hover:bg-danger/5",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9 p-0",
};

/* 옛 화면들이 아직 type="Square_lg" 식으로 부른다.
   Tailwind로 옮기지 않은 화면이 남아 있는 동안만 유지하는 대응표 */
const LEGACY_TYPES = {
  Circle: { variant: "primary", size: "icon", className: "rounded-full" },
  Square: { variant: "primary", size: "md" },
  Square_ls: { variant: "secondary", size: "sm" },
  Square_lg: { variant: "primary", size: "lg", className: "w-full" },
  Square_lc: { variant: "secondary", size: "lg", className: "w-full" },
  Square_D: {
    variant: "primary",
    size: "lg",
    className: "w-full rounded-t-none",
  },
};

const Button = ({
  text,
  children,
  type,
  variant,
  size,
  className,
  htmlType = "button",
  ...rest
}) => {
  const legacy = (type && LEGACY_TYPES[type]) || {};
  const resolvedVariant = variant ?? legacy.variant ?? "primary";
  const resolvedSize = size ?? legacy.size ?? "md";

  return (
    <button
      type={htmlType}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap",
        "transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[resolvedVariant],
        SIZES[resolvedSize],
        legacy.className,
        className
      )}
      {...rest}
    >
      {children ?? text}
    </button>
  );
};

export default Button;
