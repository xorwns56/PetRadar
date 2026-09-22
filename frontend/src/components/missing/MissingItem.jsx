import Button from "../ui/Button";
import { petTypeLabel, petGenderSymbol } from "../../utils/pet-label";

/* 목록의 카드 한 장.
   예전에는 사진 150px을 왼쪽에 두고 글을 오른쪽에 붙인 가로 줄이었다.
   실종 동물을 알아보는 단서는 결국 사진이라, 사진을 넓게 위로 올리고
   격자로 깔아 한 화면에 더 많이 보이게 했다. */
const MissingItem = ({ missingDTO, onClick, toggleModal, myMissing }) => {
  const imageSrc = missingDTO.petImage || "/image-default.png";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <button
        type="button"
        onClick={toggleModal}
        aria-label={`${missingDTO.petName} 상세 보기`}
        className="block w-full cursor-pointer overflow-hidden bg-brand-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        <img
          src={imageSrc}
          alt=""
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/image-default.png";
          }}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={toggleModal}
          className="cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
              {petTypeLabel(missingDTO.petType)}
            </span>
            <span className="truncate font-bold text-ink">
              {missingDTO.petName}
              <span className="ml-1 font-normal text-ink-muted">
                {petGenderSymbol(missingDTO.petGender)}
              </span>
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-snug font-semibold text-ink">
            {missingDTO.title}
          </p>

          <dl className="mt-3 space-y-1 text-xs text-ink-muted">
            <div className="flex gap-2">
              <dt className="shrink-0">나이</dt>
              <dd className="text-ink">{missingDTO.petAge}년생</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">실종일</dt>
              <dd className="text-ink">{missingDTO.petMissingDate}</dd>
            </div>
          </dl>
        </button>

        <div className="mt-auto pt-4">
          {myMissing ? (
            <p className="rounded-xl bg-brand-soft py-2 text-center text-xs font-semibold text-brand-ink">
              내가 신고한 글이에요
            </p>
          ) : (
            <Button variant="secondary" className="w-full" onClick={onClick}>
              제보하기
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MissingItem;
