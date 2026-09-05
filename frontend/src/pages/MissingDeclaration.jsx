import "../style/MissingDeclaration.css";
import { useEffect, useState } from "react";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import useFormFocus from "../hooks/useFormFocus";
import { MISSING_FORM_FIELDS } from "../utils/missing-form-fields";
import LocationMap from "../components/LocationMap";
import ImagePreview from "../components/ImagePreview";
import { useAuth } from '../contexts/AuthContext';

const MissingDeclaration = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, api } = useAuth();
  useEffect(() => {
    if(!isAuthenticated){
        alert("실종 신고에는 로그인이 필요합니다.");
        nav("/login", { replace: true });
        return;
    }
    setIsLoading(false);
  }, [isAuthenticated, nav]);


  const [form, setForm] = useState({
    petName: "",
    petType: "",
    petGender: "",
    petBreed: "",
    petAge: "",
    petMissingDate: "",
    petMissingPlace: "",
    petMissingPoint: null,
    petImage: "",
    title: "",
    content: "",
  });


  const today = new Date().toISOString().split("T")[0];
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const yearOption = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  const { handleRef, checkInput } = useFormFocus(form, MISSING_FORM_FIELDS);

  const onSubmitButtonClick = async () => {
    if (!checkInput()) {
      return;
    }
    try {
        // 이미지는 파일 파트로 따로 보내므로 JSON 본문에서 분리한다
        const { petMissingPoint, petImage, ...restOfForm } = form;
        const requestBody = {
          ...restOfForm,
          latitude: petMissingPoint?.lat || null,
          longitude: petMissingPoint?.lng || null,
        };
        // multipart: missing(JSON) + image(File)
        const formData = new FormData();
        formData.append("missing", new Blob([JSON.stringify(requestBody)], { type: "application/json" }));
        if (petImage) formData.append("image", petImage);

        await api.post("/api/missing", formData);
        nav("/missingList");
      } catch (error) {
          alert("신고 제출에 실패했습니다. 다시 시도해주세요.");
      }
  };

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

  const onLocationSelect = (latlng) => {
    setForm((prev) => ({
      ...prev,
      petMissingPoint: {
        lat: latlng.lat,
        lng: latlng.lng,
      },
    }));
  };

  const onSelectBreed = (breed, value, onChange) => {
    return (
      <div>
        <select name="petBreed" value={value} onChange={onChange}>
          <option value="" placeholder="">
            아래에서 선택해주세요
          </option>
          {breed === "dog" &&
            dogBreed.map((dog) => (
              <option key={dog.dogTypeNum} value={dog.dogType}>
                {dog.dogType}
              </option>
            ))}
          {breed === "cat" &&
            catBreed.map((cat) => (
              <option key={cat.catTypeNum} value={cat.catType}>
                {cat.catType}
              </option>
            ))}
          {breed === "etc" &&
            etcBreed.map((etc) => (
              <option key={etc.etcTypeNum} value={etc.etcType}>
                {etc.etcType}
              </option>
            ))}
        </select>
      </div>
    );
  };

  return (!isLoading &&
    <div className="MissingDeclaration">
      <Header leftChild={true} />{" "}
      <div className="MissingDeclaration-container inner">
        <div className="PageTitle">
          <h3>실종 동물 신고</h3>
        </div>
        <div className="MissingDeclarationForms">
          <div className="MissingDeclarationForm">
            <h4>반려동물 이름</h4>
            <input
              name="petName"
              ref={handleRef("petName")}
              value={form.petName}
              onChange={handleChange}
              placeholder="이름"
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>종류</h4>
            <select
              name="petType"
              ref={handleRef("petType")}
              value={form.petType}
              onChange={handleChange}
            >
              <option value="">아래에서 선택해주세요</option>
              <option value={"dog"}>강아지</option>
              <option value={"cat"}>고양이</option>
              <option value={"etc"}>기타</option>
            </select>
          </div>
          <div className="MissingDeclarationForm">
            <h4>성별</h4>
            <select
              name="petGender"
              ref={handleRef("petGender")}
              value={form.petGender}
              onChange={handleChange}
            >
              <option value="">아래에서 선택해주세요</option>
              <option value="F">암컷</option>
              <option value="M">수컷</option>
            </select>
          </div>
          <div className="MissingDeclarationForm">
            <h4>품종</h4>
            {onSelectBreed(form.petType, form.petBreed, handleChange)}
          </div>
          <div className="MissingDeclarationForm">
            <h4>출생년도</h4>
            <select
              name="petAge"
              ref={handleRef("petAge")}
              value={form.petAge}
              onChange={handleChange}
            >
              <option value="">출생년도를 선택해주세요</option>
              {yearOption.map((year) => (
                <option key={year} value={year}>
                  {year} (년생)
                </option>
              ))}
            </select>
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종일자</h4>
            <input
              name="petMissingDate"
              ref={handleRef("petMissingDate")}
              value={form.petMissingDate}
              onChange={handleChange}
              type="date"
              max={today}
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종장소</h4>
            <LocationMap onSelect={onLocationSelect} />
          </div>
          <div className="MissingDeclarationForm">
            <label htmlFor="imageUpload">사진첨부</label>
            <input
              id="imageUpload"
              type="file"
              name="petImage"
              accept="image/*"
              onChange={handleChange}
            />
            <ImagePreview value={form.petImage} />
          </div>
          <div className="MissingDeclarationForm">
            <h4>제목</h4>
            <input
              name="title"
              ref={handleRef("title")}
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>내용</h4>
            <textarea
              name="content"
              ref={handleRef("content")}
              value={form.content}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
            />
          </div>
          <div className="MissingDeclaration-btn">
            <Button
              onClick={onSubmitButtonClick}
              text={"신고하기"}
              type={"Square_lg"}
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissingDeclaration;
