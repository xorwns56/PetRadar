import "../style/MissingReport.css";
import Header from "../components/Header";
import Button from "../components/Button";

import LocationMap from "../components/LocationMap";
import { useReportDispatch } from "../contexts/ReportContext";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserState } from "../contexts/UserContext";
import { useMissingState } from "../contexts/MissingContext";

const MissingReport = () => {
  const dispatch = useReportDispatch();
  const userState = useUserState();
  const nav = useNavigate();
  const params = useParams();
  const missingState = useMissingState();

  useEffect(() => {
    if (
      !missingState.some(
        (item) => String(item.petMissingId) === String(params.petMissingId)
      )
    ) {
      alert("해당 게시글이 없어 제보할 수 없습니다.");
      nav("/missingList", { replace: true });
    }
  }, [params.id]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    petImage: "",
    petReportPlace: "",
    petReportPoint: null,
  });

  const onCreate = () => {
    dispatch({
      type: "CREATE",
      data: {
        ...form,
        id: userState.currentUser,
        petMissingId: params.petMissingId,
      },
    });
  };

  const onSubmitButtonClick = () => {
    onCreate();
    nav("/missingList");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "petImage") {
      if (!files[0]) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader.result);
        setForm((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
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
            {/* <input name="petImage" value={form.title} onChange={handleChange} /> */}
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
