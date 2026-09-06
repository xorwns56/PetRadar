import "../style/MissingForm.css";
import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import LocationMap from "./LocationMap";
import ImagePreview from "./ImagePreview";

// 이 폼의 필수 입력 항목과 사용자에게 보여줄 이름
// 키 순서가 곧 검사 순서다 (JS 객체는 문자열 키의 삽입 순서를 보존한다)
export const MISSING_FORM_FIELDS = {
  petName: "반려동물 이름",
  petType: "종류",
  petGender: "성별",
  petAge: "출생년도",
  petMissingDate: "실종일자",
  petMissingPoint: "실종위치",
  title: "제목",
  content: "내용",
};

// 종류에 따라 품종 목록을 바꿔 보여준다
const BREED_OPTIONS = {
  dog: { list: dogBreed, key: "dogTypeNum", value: "dogType" },
  cat: { list: catBreed, key: "catTypeNum", value: "catType" },
  etc: { list: etcBreed, key: "etcTypeNum", value: "etcType" },
};

const BreedSelect = ({ petType, value, onChange }) => {
  const option = BREED_OPTIONS[petType];
  return (
    <select name="petBreed" value={value} onChange={onChange}>
      <option value="">아래에서 선택해주세요</option>
      {option?.list.map((item) => (
        <option key={item[option.key]} value={item[option.value]}>
          {item[option.value]}
        </option>
      ))}
    </select>
  );
};

/**
 * 실종 신고 등록/수정이 함께 쓰는 입력 폼.
 * 화면마다 다른 부분(초기 지도 위치, 하단 버튼)만 props로 받는다.
 *
 * @param mapInit  수정 화면에서 기존 실종 위치를 지도에 표시할 때 사용
 * @param actions  하단 버튼 영역 (등록은 1개, 수정은 취소/수정 2개)
 */
const MissingForm = ({ form, onChange, handleRef, onLocationSelect, mapInit, actions }) => {
  const today = new Date().toISOString().split("T")[0];
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const yearOption = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="MissingForm">
      <div className="MissingForm-field">
        <h4>반려동물 이름</h4>
        <input
          name="petName"
          ref={handleRef("petName")}
          value={form.petName}
          onChange={onChange}
          placeholder="이름"
        />
      </div>
      <div className="MissingForm-field">
        <h4>종류</h4>
        <select
          name="petType"
          ref={handleRef("petType")}
          value={form.petType}
          onChange={onChange}
        >
          <option value="">아래에서 선택해주세요</option>
          <option value={"dog"}>강아지</option>
          <option value={"cat"}>고양이</option>
          <option value={"etc"}>기타</option>
        </select>
      </div>
      <div className="MissingForm-field">
        <h4>성별</h4>
        <select
          name="petGender"
          ref={handleRef("petGender")}
          value={form.petGender}
          onChange={onChange}
        >
          <option value="">아래에서 선택해주세요</option>
          <option value="F">암컷</option>
          <option value="M">수컷</option>
        </select>
      </div>
      <div className="MissingForm-field">
        <h4>품종</h4>
        <BreedSelect petType={form.petType} value={form.petBreed} onChange={onChange} />
      </div>
      <div className="MissingForm-field">
        <h4>출생년도</h4>
        <select
          name="petAge"
          ref={handleRef("petAge")}
          value={form.petAge}
          onChange={onChange}
        >
          <option value="">출생년도를 선택해주세요</option>
          {yearOption.map((year) => (
            <option key={year} value={year}>
              {year} (년생)
            </option>
          ))}
        </select>
      </div>
      <div className="MissingForm-field">
        <h4>실종일자</h4>
        <input
          name="petMissingDate"
          ref={handleRef("petMissingDate")}
          value={form.petMissingDate}
          onChange={onChange}
          type="date"
          max={today}
        />
      </div>
      <div className="MissingForm-field">
        <h4>실종장소</h4>
        <LocationMap init={mapInit} onSelect={onLocationSelect} />
      </div>
      <div className="MissingForm-field">
        <label htmlFor="imageUpload">사진첨부</label>
        <input
          id="imageUpload"
          type="file"
          name="petImage"
          accept="image/*"
          onChange={onChange}
        />
        {/* 새로 고른 파일이 없으면 서버가 내려준 기존 이미지를 보여준다 */}
        <ImagePreview value={form.petImage} />
      </div>
      <div className="MissingForm-field">
        <h4>제목</h4>
        <input
          name="title"
          ref={handleRef("title")}
          value={form.title}
          onChange={onChange}
        />
      </div>
      <div className="MissingForm-field">
        <h4>내용</h4>
        <textarea
          name="content"
          ref={handleRef("content")}
          value={form.content}
          onChange={onChange}
          placeholder="상세한 설명을 적어주세요."
        />
      </div>
      <div className="MissingForm-actions">{actions}</div>
    </div>
  );
};

export default MissingForm;
