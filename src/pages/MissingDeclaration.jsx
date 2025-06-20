import { useReducer, useRef, useState } from "react";
import { missingPet } from "../utils/missingPet";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import Header from "../components/Header";

function reducer(state, action) {
  switch (action.type) {
    case "Create":
      return [action.data, ...state];
    case "Update":
      return state.map((data) =>
        String(data.petId) === String(action.data.petId) ? action.data : data
      );
    case "Delete":
      return state.filter(
        (data) => String(data.petId) !== String(action.petId)
      );
    default:
      return state;
  }
}

const MissingDeclaration = () => {
  const idRef = useRef(4);
  const [data, dispatch] = useReducer(reducer, missingPet);

  const onCreate = () => {
    dispatch({
      type: "Create",
      data: {
        petId: idRef.current++,
        ...form,
      },
    });
  };

  const onUpdate = (petId) => {
    dispatch({
      type: "Update",
      data: {
        petId,
        ...form,
      },
    });
  };

  const onDelete = (petId) => {
    dispatch({ type: "Delete", petId: petId });
  };

  const [form, setForm] = useState({
    petName: "",
    petType: "",
    petGender: "",
    petBreed: "",
    petAge: "",
    petMissingDate: "",
    perTitle: "",
    petContent: "",
    missingPoint: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSelectBreed = (breed, value, onChange) => {
    if (breed === "dog") {
      return (
        <div>
          <select value={value} onChange={onChange}>
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
          <select value={value} onChange={onChange}>
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
          <select value={value} onChange={onChange}>
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
    <div>
      <Header leftChild={true} />
      <h2>실종 동물 제보</h2>
      <div>
        <h3>반려동물 이름</h3>
        <input placeholder="이름" />
      </div>
      <div>
        <h3>종류</h3>
        <select name="petType" value={form.petType} onChange={handleChange}>
          <option value={"dog"}>강아지</option>
          <option value={"cat"}>고양이</option>
          <option value={"etc"}>기타</option>
        </select>
      </div>
      <div>
        <h3>성별</h3>
        <select>
          <option value="F">암컷</option>
          <option value="M">수컷</option>
        </select>
      </div>
      <div>
        <h3>품종</h3>
        {onSelectBreed(form.petType, form.petBreed, handleChange)}
      </div>
      <div>
        <h3>나이</h3>
      </div>
    </div>
  );
};
export default MissingDeclaration;
