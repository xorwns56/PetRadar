/**
 * 서버가 내려준 실패 사유를 꺼낸다.
 *
 * 백엔드는 GlobalExceptionHandler가 { message, errors } 한 가지 모양으로만
 * 내려준다. 그래도 서버가 죽었거나 nginx가 대신 답한 경우처럼 그 모양이
 * 아닐 때가 있으므로, 문자열로 확인되는 것만 쓰고 나머지는 기본 문구로 넘긴다.
 *
 * @param error    axios가 던진 것
 * @param fallback 사유를 못 찾았을 때 보여줄 문구
 */
export const toMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

/**
 * 입력칸별 사유. @Valid가 걸러낸 경우에만 들어 있다.
 * { petName: "반려동물 이름을 입력해주세요.", ... }
 */
export const toFieldErrors = (error) => {
  const errors = error?.response?.data?.errors;
  return errors && typeof errors === "object" ? errors : null;
};
