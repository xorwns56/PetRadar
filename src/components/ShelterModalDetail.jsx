import Button from "../components/Button";
import "../style/ModalDetail.css";

const ShelterModalDetail = ({ animal, onClick, onClose }) => {
  if (!animal) return null;

  return (
    <div className="ModalDetail active" onClick={onClose}>
      <div className="Modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="Modal-contents">
          <div className="img-box" style={{ height: "200px" }}>
            <img
              src={animal.IMAGE_COURS || "/NoIMG.png"}
              alt="동물 이미지"
              onError={(e) => {
                e.target.src = "/NoIMG.png";
              }}
              style={{
                objectFit: "cover",
                height: "100%",
                width: "100%",
                borderRadius: "10px",
              }}
            />
          </div>

          <div className="text-contents">
            <div className="contents-t1">
              <p className="petType">{animal.SPECIES_NM}</p>
            </div>
            <div className="contents-t2">
              <h3>색상:</h3>
              <p>{animal.COLOR_NM}</p>
            </div>
            <div className="contents-t2">
              <h3>나이:</h3>
              <p>{animal.AGE_INFO}(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>특이사항:</h3>
              <p>{animal.SFETR_INFO || "없음"}</p>
            </div>
            <div className="contents-t4">
              <h3>보호소 위치:</h3>
              <p>{animal.PROTECT_PLC}</p>
              <h3>보호소 전화번호:</h3>
              <p>{animal.SHTER_TELNO}</p>
            </div>
          </div>

          <div className="Report-btn">
            <Button text={"제보하기"} type={"Square_D"} onClick={onClick} />
          </div>
        </div>

        <div className="Modal-btn" onClick={onClose}>
          <Button text={"X"} type={"Circle"} />
        </div>
      </div>
    </div>
  );
};

export default ShelterModalDetail;
