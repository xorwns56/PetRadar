import "../style/ShelterAnimalItem.css"

const ShelterAnimalItem = ({
  petId,
  petType,
  petMissingDate,
  imageUrl,
  onClick,
}) => {
  return (
    <div className="ShelterAnimalItem" onClick={onClick}>
      <div className="ShelterAnimalItem-img">
        <img
          src={imageUrl || "/image-default.png"}
          alt="유기동물"
          onError={(e) => {
            e.target.src = "/image-default.png";
          }}
        />
      </div>
      <div className="contents">
        <div className="contents-t1">
          <p className="petType">{petType}</p>
        </div>
        {/* 나이 넣어주세요. */}
        <div>
          <p>나이 : {petMissingDate}</p>
        </div>
        <div>
          <p>실종일자 : {petMissingDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ShelterAnimalItem;
