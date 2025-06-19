import { useEffect, useState } from "react";

const useShelterData = () => {
  const [animals, setAnimals] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(
            "https://openapi.gg.go.kr/AbdmAnimalProtect?Key=f2f06fff472f435591f277efff82fd36&Type=json&pIndex=1&pSize=100"
          ),
          fetch(
            "https://openapi.gg.go.kr/AbdmAnimalProtectPlace?Key=f2f06fff472f435591f277efff82fd36&Type=json&pIndex=1&pSize=100"
          ),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        const animalItems = json1.AbdmAnimalProtect?.[1]?.row || [];
        const shelterItems = json2.AbdmAnimalProtectPlace?.[1]?.row || [];

        setAnimals(animalItems);
        setShelters(shelterItems);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setError(err);
      }
    };

    fetchAll();
  }, []);

  return { animals, shelters, error };
};

export default useShelterData;

