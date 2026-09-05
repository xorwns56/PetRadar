// 실종 신고 등록/수정 폼의 필수 입력 항목과 사용자에게 보여줄 이름
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
