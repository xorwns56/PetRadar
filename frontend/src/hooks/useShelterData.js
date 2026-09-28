import { useEffect, useState } from "react";

/**
 * 보호소 관련 조회의 공통 뼈대.
 *
 * 세 화면(보호소 목록, 보호동물 목록, 홈)이 같은 로딩·에러 처리를 각자
 * 들고 있었다. 받아오는 함수만 다르므로 그 부분만 넘겨받는다.
 *
 * loading을 따로 두는 이유: data가 []로 시작하므로 길이만으로는
 * "아직 못 받음"과 "결과 없음"을 구분할 수 없다. 응답이 비었을 때
 * 로딩 화면에 갇히면 안 된다.
 *
 * @param fetcher  () => Promise<T[]>
 * @param deps     이 값이 바뀌면 다시 받는다
 * @param enabled  false면 아직 부르지 않는다 (위치 확정을 기다릴 때)
 */
export const useShelterQuery = (fetcher, deps = [], enabled = true) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    // 앞선 요청이 늦게 도착해 최신 결과를 덮어쓰지 않게 한다
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("보호소 조회 실패:", err);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // fetcher는 매 렌더 새로 만들어지므로 의존성에 넣지 않는다.
    // 다시 받아야 할 시점은 부르는 쪽이 deps로 정한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return { data, error, loading };
};

export default useShelterQuery;
