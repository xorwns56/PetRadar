import { useEffect, useState } from "react";
// import handler from "../../api/shelters";

const ShelterInfo = () => {
  const [shelterList, setShelterList] = useState([]);

  useEffect(() => {
    const fetchShelters = async () => {
      const serviceKey =
        "f6ISl+Wv7yUWp0+IGtly6gkDGU7h8l/m5cxyxgDXZmJnwNileMGkN39UXmBU5EOHGsnukcp2jg2E9VNEkq4CQw==";
      const encodedKey = encodeURIComponent(serviceKey);

      const url = `/api/1543061/abandonmentPublicService_v2/abandonmentPublic_v2?serviceKey=${encodedKey}&upr_cd=11&org&_type=json`;
      try {
        const response = await fetch(url);
        console.log(response);
        const json = await response.json();
        const items = json.response.body.items.item;
        setShelterList(items);
        localStorage.setItem("shelterList", JSON.stringify(items));
        console.log("호출 성공", json);
      } catch (error) {
        console.log("호출 에러", error);
      }
    };

    fetchShelters();
  }, []);

  return (
    <div>
      <h2>보호소 정보</h2>
      <ul>
        {shelterList.map((shelter, idx) => (
          <li key={idx}>
            {shelter.careNm} - {shelter.orgNm} -{shelter.careRegNo}
          </li>
        ))}
        <li>shelterInfo</li>
      </ul>
      <p>{shelterList}</p>

      <Map shelters={shelterList} />
    </div>
  );
};

export default ShelterInfo;
