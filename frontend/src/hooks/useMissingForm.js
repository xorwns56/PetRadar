import { useState } from "react";
import { toRegionName } from "../lib/kakaoMap";

export const EMPTY_MISSING_FORM = {
  petName: "",
  petType: "",
  petGender: "",
  petBreed: "",
  petAge: "",
  petMissingDate: "",
  petMissingPlace: "",
  petMissingPoint: null,
  // 실종 지점의 관할 지자체. 보호동물과 맞춰볼 때 서버가 쓴다
  region: "",
  petImage: "",
  title: "",
  content: "",
};

/**
 * 실종 신고 등록·수정 화면이 함께 쓰는 폼 상태.
 * 두 화면이 form 초기값·handleChange·onLocationSelect·multipart 조립까지
 * 60줄 가까이 똑같이 들고 있어 한쪽만 고치면 어긋났다.
 */
export const useMissingForm = (initial = EMPTY_MISSING_FORM) => {
  const [form, setForm] = useState(initial);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "petImage" && !files?.[0]) return;

    setForm((prev) => ({
      ...prev,
      // 이미지는 base64 변환 없이 파일 객체를 그대로 보관한다
      [name]: name === "petImage" ? files[0] : value,
      // 종류가 바뀌면 품종 선택은 초기화한다
      ...(name === "petType" ? { petBreed: "" } : {}),
    }));
  };

  /* 지점을 찍을 때 관할 지자체까지 같이 구해 둔다.
     서버에는 지오코더가 없는데, 보호동물과 맞춰보려면 지역이 필요하다 —
     공공 API는 발견 지점의 좌표를 주지 않고 관할 지자체만 주기 때문이다.
     실패해도 신고는 그대로 되고 매칭 범위만 넓어진다 */
  const onLocationSelect = (latlng) => {
    setForm((prev) => ({
      ...prev,
      petMissingPoint: { lat: latlng.lat, lng: latlng.lng },
    }));

    toRegionName(latlng.lat, latlng.lng)
      .then((region) => {
        if (region) setForm((prev) => ({ ...prev, region }));
      })
      .catch(() => {});
  };

  /**
   * multipart 본문을 만든다: missing(JSON) + image(File).
   * 이미지를 새로 고르지 않으면 image 파트를 빼고 보내 기존 이미지를 유지한다.
   */
  const buildFormData = () => {
    // 이미지는 파일 파트로 따로 보내므로 JSON 본문에서 분리한다
    const { petMissingPoint, petImage, ...restOfForm } = form;
    const requestBody = {
      ...restOfForm,
      latitude: petMissingPoint?.lat || null,
      longitude: petMissingPoint?.lng || null,
    };

    const formData = new FormData();
    formData.append(
      "missing",
      new Blob([JSON.stringify(requestBody)], { type: "application/json" })
    );
    if (petImage instanceof File) formData.append("image", petImage);
    return formData;
  };

  return { form, setForm, handleChange, onLocationSelect, buildFormData };
};

export default useMissingForm;
