/* 홈의 큰 이동 버튼.
   예전에는 호버 시 카드 전체를 주황으로 칠하고 아이콘을 invert(100%)로
   뒤집었는데, 일러스트가 음화로 바뀌어 무엇인지 알아보기 어려웠다.
   테두리·그림자·살짝 뜨는 정도로 바꿔 그림은 그대로 보이게 한다. */
const MainMenu = ({ mainTitle, subTitle, imgLink, onclick }) => {
  return (
    <button
      type="button"
      onClick={onclick}
      className="group flex cursor-pointer items-end gap-4 rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold text-ink">{mainTitle}</span>
        <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
          {subTitle}
        </span>
      </span>
      <img
        src={imgLink}
        alt=""
        className="size-12 shrink-0 transition-transform duration-200 group-hover:scale-110 sm:size-14"
      />
    </button>
  );
};

export default MainMenu;
