import "../style/MissingDeclaration.css";
import { useEffect, useState } from "react";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import {
  useMissingDispatch,
  useMissingState,
} from "../contexts/MissingContext";
import { useUserState } from "../contexts/UserContext";
import ReportMap from "../components/ReportMap";

const MissingDeclaration = () => {
  const dispatch = useMissingDispatch();
  const userState = useUserState();
  //const data = useMissingState();
  const nav = useNavigate();

  useEffect(() => {
    if (!userState.currentUser) {
      alert("실종 신고에는 로그인이 필요합니다.");
      nav("/login", { replace: true });
    }
  }, [userState.currentUser, nav]);

  const [form, setForm] = useState({
    petName: "",
    petType: "",
    petGender: "",
    petBreed: "",
    petAge: "",
    petMissingDate: "",
    petMissingPlace: "",
    petMissingPoint: { lat: null, lng: null },
    petImage: "",
    id: useUserState.currentUser,
    title: "",
    content: "",
  });
  const onCreate = () => {
    dispatch({
      type: "CREATE",
      data: {
        ...form,
      },
    });
  };
  const onSubmitButtonClick = () => {
    onCreate();
    nav("/missingList");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let newValue;

    if (name === "petImage" && files?.[0]) {
      const file = files[0];

      newValue = URL.createObjectURL(files[0]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      newValue = value;
    }
    console.log(newValue);
    if (name !== "petImage") {
      setForm((prev) => ({
        ...prev,
        [name]: newValue,
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

  const onSelectBreed = (breed, value, onChange) => {
    if (breed === "") {
      return (
        <div>
          <select name="petBreed">
            <option value="" placeholder="">
              아래에서 선택해주세요
            </option>
          </select>
        </div>
      );
    }
    if (breed === "dog") {
      return (
        <div>
          <select name="petBreed" value={value} onChange={onChange}>
            {dogBreed.map((dog) => (
              <option key={dog.dogTypeNum} value={dog.dogType}>
                {dog.dogType}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (breed === "cat") {
      return (
        <div>
          <select name="petBreed" value={value} onChange={onChange}>
            {catBreed.map((cat) => (
              <option key={cat.catTypeNum} value={cat.catType}>
                {cat.catType}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (breed === "etc") {
      return (
        <div>
          <select name="petBreed" value={value} onChange={onChange}>
            {etcBreed.map((etc) => (
              <option key={etc.etcTypeNum} value={etc.etcType}>
                {etc.etcType}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="MissingDeclaration">
      <Header leftChild={true} />{" "}
      <div className="MissingDeclaration-container inner">
        <div className="menu-title">
          <h3>실종 동물 신고</h3>
        </div>
        <div className="MissingDeclarationForms">
          <div className="MissingDeclarationForm">
            <h4>반려동물 이름</h4>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              placeholder="이름"
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>종류</h4>
            <select name="petType" value={form.petType} onChange={handleChange}>
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
            <h4>나이</h4>
            <input
              name="petAge"
              value={form.petAge}
              onChange={handleChange}
              placeholder="나이"
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종일자</h4>
            <input
              name="petMissingDate"
              value={form.petMissingDate}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종장소</h4>
            {/* <input
              name="petMissingPlace"
              value={form.petMissingPlace}
              onChange={handleChange}
              placeholder="실종된 장소를 적어주세요."
            /> */}
            <ReportMap onSelect={onLocationSelect} />
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
          </div>
          <div className="MissingDeclarationForm">
            <h4>제목</h4>
            <input name="title" value={form.title} onChange={handleChange} />
          </div>
          <div className="MissingDeclarationForm">
            <h4>내용</h4>
            <textarea
              name="content"
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
