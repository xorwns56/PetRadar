/* 코드값 → 화면 문구. 목록 카드와 상세 화면이 같은 표를
   각자 들고 있어 한쪽만 고치면 어긋났다 */
export const PET_TYPE_LABEL = {
  dog: "강아지",
  cat: "고양이",
  etc: "기타 동물",
};

export const PET_GENDER_LABEL = {
  M: "수컷",
  F: "암컷",
};

export const PET_GENDER_SYMBOL = {
  M: "♂",
  F: "♀",
};

export const petTypeLabel = (type) => PET_TYPE_LABEL[type] ?? "기타 동물";
export const petGenderLabel = (gender) => PET_GENDER_LABEL[gender] ?? "미상";
export const petGenderSymbol = (gender) => PET_GENDER_SYMBOL[gender] ?? "";
