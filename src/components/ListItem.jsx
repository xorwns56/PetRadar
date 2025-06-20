import { useEffect, useRef } from "react";
import "../style/ListItem.css";

const ShelterListSection = ({ shelters = [], onItemClick, selected }) => {
  const containerRef = useRef();

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
                  selected?.SHTER_ID === shelter.SHTER_ID ? "white" : "#fff",
                cursor: "pointer",
                padding: "30px",
              }}
              onClick={() => onItemClick(shelter)}
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
