import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 스크롤 영역의 위/아래에 내용이 더 있는지 알려준다.
 * 스크롤바만으로는 "지금 위치가 끝인지"가 잘 안 보여서,
 * 이 값으로 가장자리에 그늘을 깔아 더 있다는 걸 드러낸다.
 *
 * @returns {{ref, hasAbove, hasBelow}} ref를 스크롤되는 요소에 건다
 */
export const useScrollEdges = () => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ hasAbove: false, hasBelow: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      hasAbove: scrollTop > 1,
      // 1px은 소수점 높이에서 끝에 닿아도 남는 오차를 흡수한다
      hasBelow: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    // 사진이 뒤늦게 로드되거나 화면이 바뀌면 높이가 달라진다
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  return { ref, ...edges };
};

export default useScrollEdges;
