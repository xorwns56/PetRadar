import "../style/MissingRevise.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import Header from "../components/Header";
import Button from "../components/Button";
import LocationMap from "../components/LocationMap";
import ImagePreview from "../components/ImagePreview";
import useFormFocus from "../hooks/useFormFocus";
import { MISSING_FORM_FIELDS } from "../utils/missing-form-fields";
import { useAuth } from '../contexts/AuthContext';

const MissingRevise = () => {
  const params = useParams();
  const nav = useNavigate();
  const { api } = useAuth();
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

  useEffect(() => {
      const fetchMissingDetail = async () => {
          try {
            const response = await api.get(`/api/missing/${params.petMissingId}`);
            setForm({ ...response.data });
          } catch (error) {
            console.error("Failed to fetch missing detail:", error);
          }
        };
        fetchMissingDetail();
  }, []);


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
        // 이미지를 새로 고르지 않으면 image 파트를 빼고 보내 기존 이미지를 유지한다
        const formData = new FormData();
        formData.append("missing", new Blob([JSON.stringify(requestBody)], { type: "application/json" }));
        if (petImage instanceof File) formData.append("image", petImage);

        await api.patch(`/api/missing/${params.petMissingId}`, formData);
        nav("/myPage");
    } catch (error) {
        console.error("Failed to update :", error);
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

  const onCancellation = () => {
    alert("수정을 취소하셨습니다.");
    nav("/myPage");
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

  return (
    <div className="MissingRevise">
      <Header leftChild={true} />{" "}
      <div className="MissingRevise-container inner">
        <div className="PageTitle">
          <h3>실종 동물 신고</h3>
        </div>
        <div className="MissingReviseForms">
          <div className="MissingReviseForm">
            <h4>반려동물 이름</h4>
            <input
              name="petName"
              ref={handleRef("petName")}
              value={form.petName}
              onChange={handleChange}
              placeholder="이름"
            />
          </div>
          <div className="MissingReviseForm">
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
          <div className="MissingReviseForm">
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
          <div className="MissingReviseForm">
            <h4>품종</h4>
            {onSelectBreed(form.petType, form.petBreed, handleChange)}
          </div>
          <div className="MissingReviseForm">
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
          <div className="MissingReviseForm">
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
          <div className="MissingReviseForm">
            <h4>실종장소</h4>
            <LocationMap
              init={form.petMissingPoint}
              onSelect={onLocationSelect}
            />
          </div>
          <div className="MissingReviseForm">
            <label htmlFor="imageUpload">사진첨부</label>
            <input
              id="imageUpload"
              type="file"
              name="petImage"
              accept="image/*"
              onChange={handleChange}
            />
            {/* 새로 고른 파일이 없으면 서버가 내려준 기존 이미지를 보여준다 */}
            <ImagePreview value={form.petImage} />
          </div>
          <div className="MissingReviseForm">
            <h4>제목</h4>
            <input
              name="title"
              ref={handleRef("title")}
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="MissingReviseForm">
            <h4>내용</h4>
            <textarea
              name="content"
              ref={handleRef("content")}
              value={form.content}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
            />
          </div>
          <div className="MissingRevise-btn">
            <div>
              <Button
                onClick={onCancellation}
                text={"취소하기"}
                type={"Square_lc"}
              ></Button>
            </div>
            <div>
              <Button
                onClick={onSubmitButtonClick}
                text={"수정하기"}
                type={"Square_lg"}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissingRevise;
