/* 보호소 유기동물 카드. 실종 목록의 MissingItem과 같은 모양으로 맞춰
   두 목록을 오갈 때 눈이 다시 적응하지 않게 한다 */
const ShelterAnimalItem = ({
  petType,
  petAge,
  petColor,
  petMissingDate,
  imageUrl,
  onClick,
}) => {
  //입소일자 (-)추가
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
      6,
      8
    )}`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="block overflow-hidden bg-brand-soft">
        <img
          src={imageUrl || "/image-default.png"}
          alt=""
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/image-default.png";
          }}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </span>

      <span className="flex flex-1 flex-col p-4">
        <span className="block">
          <span className="inline-block rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
            {petType}
          </span>
        </span>

        <dl className="mt-3 space-y-1 text-xs text-ink-muted">
          <div className="flex gap-2">
            <dt className="shrink-0">색상</dt>
            <dd className="truncate text-ink">{petColor}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">나이</dt>
            <dd className="truncate text-ink">{petAge}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">입소일</dt>
            <dd className="text-ink">{formatDate(petMissingDate)}</dd>
          </div>
        </dl>
      </span>
    </button>
  );
};

export default ShelterAnimalItem;
