import { dogBreed, catBreed, etcBreed } from "../utils/get-pet-breed";
import LocationMap from "./LocationMap";
import ImageField from "./ImageField";
import FormField, { controlClass, textareaClass } from "./FormField";

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

const BreedSelect = ({ id, petType, value, onChange }) => {
  const option = BREED_OPTIONS[petType];
  return (
    <select
      id={id}
      name="petBreed"
      value={value}
      onChange={onChange}
      disabled={!option}
      className={`${controlClass} disabled:bg-page disabled:text-ink-muted`}
    >
      <option value="">
        {option ? "아래에서 선택해주세요" : "종류를 먼저 골라주세요"}
      </option>
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
const MissingForm = ({
  form,
  onChange,
  handleRef,
  onLocationSelect,
  mapInit,
  actions,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const yearOption = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      {/* 한 단으로 세운다. 좌우로 나누면 어느 쪽을 먼저 채워야 하는지
          읽는 순서가 흐려지고, 칸 폭이 반으로 줄어 지도·사진이 답답해진다.
          대신 본문 폭(Layout width="content")을 좁혀 줄이 길어지지 않게 한다 */}
      <div className="flex flex-col gap-5">
        <FormField label="반려동물 이름" htmlFor="petName">
          <input
            id="petName"
            name="petName"
            ref={handleRef("petName")}
            value={form.petName}
            onChange={onChange}
            placeholder="이름"
            className={controlClass}
          />
        </FormField>

        <FormField label="종류" htmlFor="petType">
          <select
            id="petType"
            name="petType"
            ref={handleRef("petType")}
            value={form.petType}
            onChange={onChange}
            className={controlClass}
          >
            <option value="">아래에서 선택해주세요</option>
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
            <option value="etc">기타</option>
          </select>
        </FormField>

        <FormField label="성별" htmlFor="petGender">
          <select
            id="petGender"
            name="petGender"
            ref={handleRef("petGender")}
            value={form.petGender}
            onChange={onChange}
            className={controlClass}
          >
            <option value="">아래에서 선택해주세요</option>
            <option value="F">암컷</option>
            <option value="M">수컷</option>
          </select>
        </FormField>

        <FormField
          label="품종"
          htmlFor="petBreed"
          hint="목격자가 가장 많이 찾는 항목이에요."
        >
          <BreedSelect
            id="petBreed"
            petType={form.petType}
            value={form.petBreed}
            onChange={onChange}
          />
        </FormField>

        <FormField label="출생년도" htmlFor="petAge">
          <select
            id="petAge"
            name="petAge"
            ref={handleRef("petAge")}
            value={form.petAge}
            onChange={onChange}
            className={controlClass}
          >
            <option value="">출생년도를 선택해주세요</option>
            {yearOption.map((year) => (
              <option key={year} value={year}>
                {year} (년생)
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="실종일자" htmlFor="petMissingDate">
          <input
            id="petMissingDate"
            name="petMissingDate"
            ref={handleRef("petMissingDate")}
            value={form.petMissingDate}
            onChange={onChange}
            type="date"
            max={today}
            className={controlClass}
          />
        </FormField>

        <FormField label="실종장소" hint="지도를 눌러 위치를 찍어주세요.">
          {/* 지도는 스스로 높이를 갖지 못하므로 여기서 정해 준다 */}
          <div className="h-64 overflow-hidden rounded-xl border border-line sm:h-72">
            <LocationMap init={mapInit} onSelect={onLocationSelect} />
          </div>
        </FormField>

        <FormField label="사진첨부" htmlFor="imageUpload">
          {/* 새로 고른 파일이 없으면 서버가 내려준 기존 이미지를 보여준다 */}
          <ImageField value={form.petImage} onChange={onChange} />
        </FormField>

        <FormField label="제목" htmlFor="title">
          <input
            id="title"
            name="title"
            ref={handleRef("title")}
            value={form.title}
            onChange={onChange}
            className={controlClass}
          />
        </FormField>

        <FormField label="내용" htmlFor="content">
          <textarea
            id="content"
            name="content"
            ref={handleRef("content")}
            value={form.content}
            onChange={onChange}
            placeholder="상세한 설명을 적어주세요."
            className={textareaClass}
          />
        </FormField>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {actions}
      </div>
    </div>
  );
};

export default MissingForm;
