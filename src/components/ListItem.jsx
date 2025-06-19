import { useEffect, useRef } from "react";
import "../style/ListItem.css";

const ShelterListSection = ({ shelters, onItemClick, selected }) => {
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
      {shelters.map((shelter) => (
        <div
          className="ItemListst"
          key={shelter.SHTER_ID}
          id={`item-${shelter.SHTER_ID}`}
          style={{
            backgroundColor:
              selected?.SHTER_ID === shelter.SHTER_ID ? "white" : "#fff",
            cursor: "pointer",
            padding: "30px",
          }}
          onClick={() => onItemClick(shelter)}
        >
          <strong>{shelter.SHTER_NM}</strong>
          <div>{shelter.REFINE_ROADNM_ADDR || "주소 없음"}</div>
        </div>
      ))}
    </div>
  );
};

export default ShelterListSection;
