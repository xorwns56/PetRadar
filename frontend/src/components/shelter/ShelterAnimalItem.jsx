import { formatPublicDate, formatSex } from "../../utils/shelter-label";

/* 보호소 유기동물 카드. 실종 목록의 MissingItem과 같은 모양으로 맞춰
   두 목록을 오갈 때 눈이 다시 적응하지 않게 한다 */
const ShelterAnimalItem = ({ animal, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  >
    <span className="block overflow-hidden bg-brand-soft">
      <img
        src={animal.imageUrl || "/image-default.png"}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/image-default.png";
        }}
        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </span>

    <span className="flex flex-1 flex-col p-4">
      <span className="flex items-center gap-2">
        <span className="inline-block rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
          {animal.kindType}
        </span>
        {/* 품종은 절반이 "믹스견"이라 단독으로는 구분이 잘 안 된다.
            축종 배지 옆에 붙여 같이 읽히게 한다 */}
        <span className="min-w-0 truncate text-sm font-bold text-ink">
          {animal.breed}
        </span>
      </span>

      <dl className="mt-3 space-y-1 text-xs text-ink-muted">
        <div className="flex gap-2">
          <dt className="shrink-0">색상</dt>
          <dd className="truncate text-ink">{animal.color || "미상"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">나이</dt>
          <dd className="truncate text-ink">
            {animal.age || "미상"} · {formatSex(animal.sex)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">발견일</dt>
          <dd className="text-ink">{formatPublicDate(animal.foundDate)}</dd>
        </div>
      </dl>
    </span>
  </button>
);

export default ShelterAnimalItem;
