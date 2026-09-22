import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { useScrollEdges } from "../../hooks/useScrollEdges";

/* 상세 모달의 공통 틀.
   예전 ModalDetail.css는 350x450 고정에 #root 기준 absolute였고,
   닫기 버튼을 카드 밖에 두려고 clamp()로 화면 폭에 따라 위치를 계산했다.
   여기서는 화면 기준으로 가운데 띄우고, 내용이 길면 안에서만 스크롤한다. */
const Dialog = ({ onClose, image, media, badge, title, children, footer }) => {
  const { ref: bodyRef, hasAbove, hasBelow } = useScrollEdges();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    // 열려 있는 동안 뒤 화면이 같이 스크롤되지 않게 막는다
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
      >
        <div className="relative shrink-0">
          {/* 사진 대신 지도처럼 다른 걸 얹고 싶으면 media로 넘긴다 */}
          {media ?? (
            <img
              src={image || "/image-default.png"}
              alt=""
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/image-default.png";
              }}
              className="aspect-[16/10] w-full bg-brand-soft object-cover"
            />
          )}
          {/* 닫기는 항상 사진 위 오른쪽 같은 자리 */}
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ✕
          </button>
        </div>

        {/* 본문이 길면 여기서만 스크롤된다.
            스크롤바를 항상 띄우고(scroll-visible), 가려진 쪽 가장자리에
            그늘을 깔아 "위/아래에 더 있다"를 눈에 보이게 한다 */}
        {/* 바깥은 그늘을 얹을 기준(relative)이자 flex 사슬을 잇는 칸.
            여기를 flex로 두지 않으면 안쪽의 min-h-0/flex-1이 풀리지 않아
            본문이 스크롤되지 않고 그냥 잘린다 */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={bodyRef}
            className="scroll-visible min-h-0 flex-1 overflow-y-auto p-5"
          >
            <div>
              {(badge || title) && (
                <div className="mb-4 flex items-center gap-2">
                  {badge && (
                    <span className="shrink-0 rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                      {badge}
                    </span>
                  )}
                  {title && (
                    <h2 className="truncate text-lg font-bold text-ink">
                      {title}
                    </h2>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>

          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 right-2.5 left-0 h-6 bg-gradient-to-b from-surface to-transparent transition-opacity duration-200",
              hasAbove ? "opacity-100" : "opacity-0"
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute right-2.5 bottom-0 left-0 h-8 bg-gradient-to-t from-surface to-transparent transition-opacity duration-200",
              hasBelow ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {footer && (
          <div className="shrink-0 border-t border-line p-4">{footer}</div>
        )}
      </div>
    </div>
  );
};

/* 라벨 + 값 한 줄 */
export const DialogField = ({ label, value }) => (
  <section className="mt-4 first:mt-0">
    <h3 className="text-sm font-bold text-ink">{label}</h3>
    <p className="mt-1.5 text-sm leading-relaxed break-keep text-ink-muted">
      {value || "없음"}
    </p>
  </section>
);

export default Dialog;
