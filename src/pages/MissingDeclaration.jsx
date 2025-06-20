import '../style/MissingDeclaration.css';
import { useReducer, useRef, useState } from 'react';
import { missingPet } from '../utils/missingPet';
import { getStringDate } from '../utils/get-stringed-date';
import { dogBreed, catBreed, etcBreed } from '../utils/get-pet-breed';
import Header from '../components/Header';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

function reducer(state, action) {
  switch (action.type) {
    case 'Create':
      return [action.data, ...state];
    case 'Update':
      return state.map((data) => (String(data.petId) === String(action.data.petId) ? action.data : data));
    case 'Delete':
      return state.filter((data) => String(data.petId) !== String(action.petId));
    default:
      return state;
  }
}

const MissingDeclaration = () => {
  const nav = useNavigate();
  const idRef = useRef(4);
  const [data, dispatch] = useReducer(reducer, missingPet);

  const onCreate = () => {
    dispatch({
      type: 'Create',
      data: {
        petId: idRef.current++,
        ...form,
      },
    });
  };

  const onUpdate = (petId) => {
    dispatch({
      type: 'Update',
      data: {
        petId,
        ...form,
      },
    });
  };

  const onDelete = (petId) => {
    dispatch({ type: 'Delete', petId: petId });
  };

  const [form, setForm] = useState({
    petName: '',
    petType: '',
    petGender: '',
    petBreed: '',
    petAge: '',
    petMissingDate: new Date(),
    petTitle: '',
    petContent: '',
    missingPoint: '',
    petImage: '',
  });
  const onSubmitButtonClick = () => {
    onCreate(data);
    nav('/missingList');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let newValue;

    if (name === 'petMissingDate') {
      newValue = new Date(value);
    } else if (name === 'petImage' && files?.[0]) {
      newValue = URL.createObjectURL(files[0]);
    } else {
      newValue = value;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const onSelectBreed = (breed, value, onChange) => {
    if (breed === '') {
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
    if (breed === 'dog') {
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
    if (breed === 'cat') {
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
    if (breed === 'etc') {
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
      <Header leftChild={true} />{' '}
      <div className="MissingDeclaration-container inner">
        <div className="menu-title">
          <h3>실종 동물 신고</h3>
        </div>
        <div className="MissingDeclarationForms">
          <div className="MissingDeclarationForm">
            <h4>반려동물 이름</h4>
            <input name="petName" value={form.petName} onChange={handleChange} placeholder="이름" />
          </div>
          <div className="MissingDeclarationForm">
            <h4>종류</h4>
            <select name="petType" value={form.petType} onChange={handleChange}>
              <option value="">아래에서 선택해주세요</option>
              <option value={'dog'}>강아지</option>
              <option value={'cat'}>고양이</option>
              <option value={'etc'}>기타</option>
            </select>
          </div>
          <div className="MissingDeclarationForm">
            <h4>성별</h4>
            <select name="petGender" value={form.petGender} onChange={handleChange}>
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
            <input name="petAge" value={form.petAge} onChange={handleChange} placeholder="나이" />
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종일자</h4>
            <input
              name="petMissingDate"
              value={getStringDate(form.petMissingDate)}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div className="MissingDeclarationForm">
            <h4>실종장소</h4>
            <input
              name="missingPoint"
              value={form.missingPoint}
              onChange={handleChange}
              placeholder="실종된 장소를 적어주세요."
            />
          </div>
          <div className="MissingDeclarationForm">
            <label htmlFor="imageUpload">사진첨부</label>
            <input id="imageUpload" type="file" name="petImage" accept="image/*" onChange={handleChange} />
          </div>
          <div className="MissingDeclarationForm">
            <h4>제목</h4>
            <input name="petTitle" value={form.petTitle} onChange={handleChange} />
          </div>
          <div className="MissingDeclarationForm">
            <h4>내용</h4>
            <textarea
              name="petContent"
              value={form.petContent}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
            />
          </div>
          <div className="MissingDeclaration-btn">
            <Button onClick={onSubmitButtonClick} text={'신고하기'} type={'Square_lg'}></Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissingDeclaration;
