import { useEffect, useState } from "react";
import Button from "../components/Button";
import ListItem from "../components/ListItem";
import axios from "axios";

const MissingList = () => {
  const [missingPetList, setMissingPetList] = useState([]);
  const API_KEY = import.meta.env.VITE_API_KEY;

  const apiMissingPet = async () => {
    try {
      const url =
        "https://openapi.gg.go.kr/AbdmAnimalProtect?Key=60554ebd49694348a45e46de06912bbd&Type=json&pIndex=1&pSize=100";
      const response = await axios.get(url, {
        params: {
          KEY: API_KEY,
          Type: "json",
          pIndex: 1,
          pSize: 20,
        },
      });
      const data = response?.data?.AbdmAnimalProtect;
      console.log(data);
      if (data) {
        setMissingPetList(data);
      }
    } catch (error) {
      console.log("API 호출 실패 : ", error);
    }
  };

  useEffect(() => {
    apiMissingPet();
  }, []);

  return (
    <div
      style={{ border: "1px solid black", width: "500px", height: "1000pxs" }}
    >
      <h2>실종 동물 목록</h2>
      <div>
        <select>
          <option value={"latest"}>최신순</option>
          <option value={"oldest"}>오래된 순</option>
        </select>
        <input placeholder="검색할 제목을 입력하세요." />
        <Button />
      </div>
      <div>
        <ListItem />
        <ListItem />
        <ListItem />
      </div>
    </div>
  );
};
export default MissingList;
