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

/**
 * 이름 뒤에 붙는 조사를 받침에 맞춘다.
 * "초코를" / "바둑을"처럼 갈리는데, 알림 문구가 반려동물 이름을 그대로 쓴다.
 *
 * @param word 앞말
 * @param pair "을/를"처럼 받침 있음/없음 순서로 적은 조사
 */
export const withJosa = (word, pair) => {
  const [withBatchim, withoutBatchim] = pair.split("/");
  if (!word) return withoutBatchim;

  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  // 한글이 아니면(영문·숫자) 판단할 수 없으므로 받침 없는 쪽으로 둔다
  if (code < 0xac00 || code > 0xd7a3) return withoutBatchim;

  return (code - 0xac00) % 28 > 0 ? withBatchim : withoutBatchim;
};
