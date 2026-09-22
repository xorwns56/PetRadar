import { cn } from "../../utils/cn";

const Pagination = ({ totalItems, page, itemSize, onClick, pageSize = 5 }) => {
  const totalPages = Math.ceil(totalItems / itemSize);
  if (totalPages <= 1) return null;

  const currPageBlock = Math.floor((page - 1) / pageSize) + 1;
  const blockEnd = currPageBlock * pageSize;
  const blockStart = blockEnd - pageSize + 1;

  // 예전에는 총 페이지를 넘는 번호도 그려 놓고 .hide로 감췄다.
  // 없는 페이지는 아예 만들지 않는다
  const pageArr = [];
  for (let i = blockStart; i <= Math.min(blockEnd, totalPages); i++) {
    pageArr.push(i);
  }

  const handlePageChange = (newPage) =>
    onClick(Math.min(totalPages, Math.max(1, newPage)));

  const cell =
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors";

  return (
    <nav aria-label="페이지" className="mt-6 flex items-center justify-center gap-1">
      {blockStart > 1 && (
        <button
          type="button"
          aria-label="이전 페이지 묶음"
          onClick={() => handlePageChange(blockStart - 1)}
          className={cn(cell, "text-ink-muted hover:bg-black/5")}
        >
          ‹
        </button>
      )}

      {pageArr.map((item) => (
        <button
          key={item}
          type="button"
          aria-current={item === page ? "page" : undefined}
          onClick={() => handlePageChange(item)}
          className={cn(
            cell,
            item === page
              ? "bg-brand font-bold text-white"
              : "text-ink-muted hover:bg-black/5 hover:text-ink"
          )}
        >
          {item}
        </button>
      ))}

      {blockEnd < totalPages && (
        <button
          type="button"
          aria-label="다음 페이지 묶음"
          onClick={() => handlePageChange(blockEnd + 1)}
          className={cn(cell, "text-ink-muted hover:bg-black/5")}
        >
          ›
        </button>
      )}
    </nav>
  );
};

export default Pagination;
