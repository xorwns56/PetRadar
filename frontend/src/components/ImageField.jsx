import ImagePreview from "./ImagePreview";

/* 사진 첨부. 브라우저 기본 <input type="file">은 화면마다 생김새가 달라
   보이지 않게 숨기고 label을 버튼처럼 쓴다. */
const ImageField = ({ id = "imageUpload", name = "petImage", value, onChange }) => {
  const hasImage = Boolean(value);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-4 text-sm font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand focus-within:border-brand"
      >
        <input
          id={id}
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="sr-only"
        />
        {hasImage ? "다른 사진 고르기" : "사진 고르기"}
      </label>
      <ImagePreview value={value} />
    </div>
  );
};

export default ImageField;
