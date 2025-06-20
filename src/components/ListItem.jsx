import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/ListItem.css";

const ShelterListSection = ({ shelters = [], selected }) => {
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selected || !containerRef.current || !selected.SHTER_ID) return;
    const el = containerRef.current.querySelector(`#item-${selected.SHTER_ID}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selected]);

  return (
    <div className="ListContainer" ref={containerRef}>
      {Array.isArray(shelters) &&
        shelters.map((shelter, index) => {
          const key =
            shelter.SHTER_ID ??
            `${shelter.SHTER_NM || "unknown"}-${shelter.careRegNo || index}`;

          return (
            <div
              className="ItemListst"
              key={key}
              id={`item-${shelter.SHTER_ID || index}`}
              style={{
                backgroundColor:
                  selected?.SHTER_ID === shelter.SHTER_ID ? "#f0f0f0" : "#fff",
                cursor: "pointer",
                padding: "30px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => {
                if (shelter.careRegNo) {
                  navigate(`/shelter/${shelter.careRegNo}`);
                } else {
                  alert("careRegNo 없음 - 이동 불가");
                }
              }}
            >
              <strong>{shelter.SHTER_NM || "이름 없음"}</strong>
              <div>{shelter.REFINE_ROADNM_ADDR || "주소 없음"}</div>
            </div>
          );
        })}
    </div>
  );
};

export default ShelterListSection;
