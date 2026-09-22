import { useEffect, useState } from "react";
import { fetchShelterAnimals } from "../api/shelter";

/**
 * 보호소 유기동물 목록을 받아온다.
 * ShelterList와 ShelterAnimalList가 각각 부르므로 같은 요청이 두 번 나간다.
 * 캐시가 필요해지면 이 훅 하나만 고치면 된다.
 */
const useShelterData = () => {
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState(null);
  // animals는 []로 시작하므로 길이만으로는 "아직 못 받음"과 "결과 없음"을
  // 구분할 수 없다. 응답이 비어 있을 때 로딩 화면에 갇히지 않도록 따로 둔다
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShelterAnimals()
      .then(setAnimals)
      .catch((err) => {
        console.error("API 호출 실패:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { animals, error, loading };
};

export default useShelterData;
