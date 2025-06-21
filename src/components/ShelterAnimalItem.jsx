const ShelterAnimalItem = ({
  petId,
  petType,
  petMissingDate,
  imageUrl,
  onClick,
}) => {
  return (
    <div className="MissingItem" onClick={onClick}>
      <div className="MissingItem-img">
        <img
          src={imageUrl || "/NoIMG.png"}
          alt="유기동물"
          onError={(e) => {
            e.target.src = "/NoIMG.png";
          }}
        />
      </div>
      <div className="contents">
        <div className="contents-t1">
          <p className="petType">{petType}</p>
        </div>
        <div className="contents-t3">
          <p>실종일자 : {petMissingDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ShelterAnimalItem;
