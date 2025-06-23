import "../style/MissingRevise.css";
import { useUserState } from "../contexts/UserContext";
import {
  useMissingState,
  useMissingDispatch,
} from "../contexts/MissingContext";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";

import Header from "../components/Header";
import Button from "../components/Button";
import LocationMap from "../components/LocationMap";

const MissingRevise = () => {
  const userState = useUserState();
  const missingList = useMissingState();
  const dispatch = useMissingDispatch();
  const params = useParams();
  const nav = useNavigate();

  const reviseList = missingList.find(
    (item) => String(item.petMissingId) === String(params.petMissingId)
  );
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
    if (!reviseList) {
      alert("해당 게시글이 없어 게시글을 수정할 수 없습니다.");
      nav("/myPage", { replace: true });
    } else {
      setForm({ ...reviseList });
    }
  }, [reviseList]);

  const onUpdate = () => {
    dispatch({
      type: "UPDATE",
      data: {
        ...form,
        id: userState.currentUser,
        petMissingId: params.petMissingId,
      },
    });
  };
  const onSubmitButtonClick = () => {
    onUpdate();
    nav("/myPage");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "petImage" && files?.[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader.result);
        setForm((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name !== "petImage") {
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
              value={form.petName}
              onChange={handleChange}
              placeholder="이름"
            />
          </div>
          <div className="MissingReviseForm">
            <h4>종류</h4>
            <select name="petType" value={form.petType} onChange={handleChange}>
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
            <h4>나이</h4>
            <input
              name="petAge"
              value={form.petAge}
              onChange={handleChange}
              placeholder="나이"
            />
          </div>
          <div className="MissingReviseForm">
            <h4>실종일자</h4>
            <input
              name="petMissingDate"
              value={form.petMissingDate}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div className="MissingReviseForm">
            <h4>실종장소</h4>
            <LocationMap onSelect={onLocationSelect} />
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
            <input name="title" value={form.title} onChange={handleChange} />
          </div>
          <div className="MissingReviseForm">
            <h4>내용</h4>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
            />
          </div>
          <div className="MissingRevise-btn">
            <Button
              onClick={onSubmitButtonClick}
              text={"수정하기"}
              type={"Square_lg"}
            ></Button>
            <Button
              onClick={onCancellation}
              text={"취소하기"}
              // type={"Square_lg"}
            ></Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissingRevise;
