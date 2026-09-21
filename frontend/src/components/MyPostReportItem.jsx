/* 내 실종 글에 들어온 목격 제보 한 건 */
const MyPostReportItem = ({ title, content, petImage, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  >
    <img
      src={petImage || "/image-default.png"}
      alt=""
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/image-default.png";
      }}
      className="size-20 shrink-0 rounded-xl bg-brand-soft object-cover"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate font-bold text-ink">{title}</span>
      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-ink-muted">
        {content}
      </span>
      <span className="mt-2 block text-xs font-semibold text-brand-ink group-hover:text-brand">
        상세보기 →
      </span>
    </span>
  </button>
);

export default MyPostReportItem;
