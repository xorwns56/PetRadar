/* 제목 + 설명 + 오른쪽 조작 버튼 한 줄.
   .PageTitle을 Home / MissingList / MissingDeclaration CSS가 각각
   따로 정의하던 것을 하나로 합쳤다 */
const PageHeading = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-ink-muted sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeading;
