import { useRef } from "react";

// 실종 신고 & 실종 신고 수정 페이지 사용 Hook 생성
// 현재 form, fields(검사할 key → 사용자에게 보여질 이름). 키 순서가 검사 순서가 된다
const useFormFocus = (formState, fields = {}) => {
  const inputRef = useRef({});

  // 비어있는 input 태그 찾기
  const checkInput = () => {
    for (const [key, label] of Object.entries(fields)) {
      // form 에 key 값이 없으면
      if (!formState[key]) {
        alert(`${label || key}을(를) 입력해주세요`);
        inputRef.current[key]?.focus();
        return false;
      }
    }
    return true;
  };

  const handleRef = (key) => (e) => {
    inputRef.current[key] = e;
  };

  return {
    handleRef,
    checkInput,
  };
};

export default useFormFocus;
