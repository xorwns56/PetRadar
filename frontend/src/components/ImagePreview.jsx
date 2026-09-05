import { useEffect, useState } from "react";
import "../style/ImagePreview.css";

/**
 * 선택한 이미지를 미리 보여준다.
 * value는 새로 고른 파일(File)이거나, 수정 화면에서 서버가 내려준 기존 이미지 경로(string)일 수 있다.
 */
const ImagePreview = ({ value }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    // 파일이 바뀌거나 화면을 떠날 때 해제하지 않으면 메모리에 남는다
    return () => URL.revokeObjectURL(url);
  }, [value]);

  // 새로 고른 파일이 있으면 그것을, 없으면 기존 이미지 경로를 보여준다
  const src = objectUrl || (typeof value === "string" && value ? value : null);
  if (!src) return null;

  return <img className="ImagePreview" src={src} alt="선택한 이미지 미리보기" />;
};

export default ImagePreview;
