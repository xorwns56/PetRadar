import { cn } from "../../utils/cn";

/* 폼 입력칸의 공통 치수.
   예전에는 MissingForm.css와 MissingReport.css가 같은 값을 따로 들고 있어
   한쪽만 고치면 두 화면의 입력칸 높이가 어긋났다 */
export const controlClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none";

export const textareaClass =
  "min-h-28 w-full resize-none rounded-xl border border-line bg-surface p-3.5 text-sm leading-relaxed text-ink transition-colors focus:border-brand focus:outline-none";

/* 라벨 + 입력칸 한 묶음 */
const FormField = ({ label, htmlFor, hint, className, children }) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs leading-relaxed text-ink-muted">{hint}</p>}
  </div>
);

export default FormField;
