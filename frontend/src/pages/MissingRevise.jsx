import "../style/MissingRevise.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import useFormFocus from "../hooks/useFormFocus";
import MissingForm, { MISSING_FORM_FIELDS } from "../components/MissingForm";
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

  return (
    <div className="MissingRevise">
      <Header leftChild={true} />{" "}
      <div className="MissingRevise-container inner">
        <div className="PageTitle">
          <h3>실종 동물 신고</h3>
        </div>
        <MissingForm
          form={form}
          onChange={handleChange}
          handleRef={handleRef}
          onLocationSelect={onLocationSelect}
          mapInit={form.petMissingPoint}
          actions={
            <>
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
            </>
          }
        />
      </div>
    </div>
  );
};
export default MissingRevise;
