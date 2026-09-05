import "../style/MissingReport.css";
import Header from "../components/Header";
import Button from "../components/Button";

import LocationMap from "../components/LocationMap";
import ImagePreview from "../components/ImagePreview";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const MissingReport = () => {
  const nav = useNavigate();
  const params = useParams();
  const { api } = useAuth();
  const [form, setForm] = useState({
    title: "",
    content: "",
    petImage: null,   // 파일 객체를 그대로 담는다
    petReportPlace: "",
    petReportPoint: null,
  });
  const onSubmitButtonClick = async () => {
      try {
          // 이미지는 파일 파트로 따로 보내므로 JSON 본문에서 분리한다
          const { petReportPoint, petImage, ...restOfForm } = form;
          const requestBody = {
            ...restOfForm,
            latitude: petReportPoint ? petReportPoint.lat : null,
            longitude: petReportPoint ? petReportPoint.lng : null,
          };
          // multipart: report(JSON) + image(File)
          const formData = new FormData();
          formData.append("report", new Blob([JSON.stringify(requestBody)], { type: "application/json" }));
          if (petImage) formData.append("image", petImage);

          await api.post(`/api/report/missing/${params.petMissingId}`, formData);
          nav("/missingList");
      } catch (error) {
          alert("제보 등록에 실패했습니다. 다시 시도해주세요.");
      }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "petImage") {
      if (!files[0]) return;
      // base64 변환 없이 파일 객체를 그대로 보관한다
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const onLocationSelect = (latlng) => {
    setForm((prev) => ({
      ...prev,

      petReportPoint: {
        lat: latlng.lat,
        lng: latlng.lng,
      },
    }));
  };

  return (
    <div className="MissingReport">
      <Header leftChild={true} />
      <div className="MissingReport-container inner">
        <div className="menu-title">
          <h3>실종 동물 제보하기</h3>
        </div>
        <div className="MissingReportForms">
          <div className="MissingReportForm">
            <h3>사진</h3>
            <input
              type="file"
              name="petImage"
              accept="image/*"
              onChange={handleChange}
            />
            <ImagePreview value={form.petImage} />
          </div>
          <div className="MissingReportForm">
            <h3>제목</h3>
            {/* <input type="text" /> */}

            <input name="title" value={form.title} onChange={handleChange} />
          </div>
          <div className="MissingReportForm">
            <h3>내용</h3>
            {/* <textarea type="text" placeholder="상세한 설명을 적어주세요." /> */}
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
            />
          </div>

          <div className="MissingReportForm">
            <h3>발견 장소</h3>
            <LocationMap onSelect={onLocationSelect} />
          </div>
          <div className="MissingReport-btn">
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
export default MissingReport;
