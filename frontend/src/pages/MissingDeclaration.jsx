import "../style/MissingDeclaration.css";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import useFormFocus from "../hooks/useFormFocus";
import MissingForm, { MISSING_FORM_FIELDS } from "../components/MissingForm";
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

  return (!isLoading &&
    <div className="MissingDeclaration">
      <Header leftChild={true} />{" "}
      <div className="MissingDeclaration-container inner">
        <div className="PageTitle">
          <h3>실종 동물 신고</h3>
        </div>
        <MissingForm
          form={form}
          onChange={handleChange}
          handleRef={handleRef}
          onLocationSelect={onLocationSelect}
          actions={
            <Button
              onClick={onSubmitButtonClick}
              text={"신고하기"}
              type={"Square_lg"}
            ></Button>
          }
        />
      </div>
    </div>
  );
};
export default MissingDeclaration;
