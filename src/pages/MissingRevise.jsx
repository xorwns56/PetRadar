import "../style/MissingRevise.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import Header from "../components/Header";
import Button from "../components/Button";
import LocationMap from "../components/LocationMap";
import useFormFocus from "../hooks/useFormFocus";

const MissingRevise = () => {
  const params = useParams();
  const nav = useNavigate();

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
            console.log(response);
            //setForm({ ...reviseList });
          } catch (error) {
            console.error("Failed to fetch missing detail:", error);
          }
        };
        fetchMissingDetail();
  }, []);

  const onUpdate = () => {
      /*
    dispatch({
      type: "UPDATE",
      data: {
        ...form,
        id: userState.currentUser,
        petMissingId: params.petMissingId,
      },
    });
*/
  };

  const today = new Date().toISOString().split("T")[0];
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const yearOption = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  const formKeys = [
    "petName",
    "petType",
    "petGender",
    "petAge",
    "petMissingDate",
    "petMissingPoint",
    "title",
    "content",
  ];

  const formKeysLabel = {
    petName: "반려동물 이름",
    petType: "종류",
    petGender: "성별",
    petAge: "출생년도",
    petMissingDate: "실종일자",
    petMissingPoint: "실종위치",
    title: "제목",
    content: "내용",
  };

  const { handleRef, checkInput } = useFormFocus(form, formKeys, formKeysLabel);

  const onSubmitButtonClick = () => {
    if (!checkInput()) {
      return;
    }
    onUpdate();
    nav("/myPage");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "petType") {
      setForm({ ...form, petBreed: "" });
    }
    if (name === "petImage" && files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader.result);
        setForm((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    }

    if (name !== "petImage") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
