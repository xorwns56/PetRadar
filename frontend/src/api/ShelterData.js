import { useEffect, useState } from "react";

const useShelterData = () => {
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState(null);
  // animals는 []로 시작하므로 길이만으로는 "아직 못 받음"과 "결과 없음"을
  // 구분할 수 없다. 응답이 비어 있을 때 로딩 화면에 갇히지 않도록 따로 둔다
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await fetch(
          "https://openapi.gg.go.kr/AbdmAnimalProtect?Key=f2f06fff472f435591f277efff82fd36&Type=json&pIndex=1&pSize=100"
        );
        if (!res.ok) {
          // fetch는 4xx/5xx를 예외로 보지 않으므로 직접 확인한다
          throw new Error(`보호소 API 응답 오류: ${res.status}`);
        }
        const json = await res.json();

        const items = json.AbdmAnimalProtect?.[1]?.row || [];
        setAnimals(items);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return { animals, error, loading };
};

export default useShelterData;


