const ShelterAnimalItem = ({
  petId,
  petType,
  petGender,
  petName,
  petAge,
  petMissingDate,
  imageUrl,
  onClick,
}) => {
  return (
    <div className="MissingItem" onClick={onClick}>
      <div className="MissingItem-img">
        <img
          src={imageUrl || "/noimage.png"}
          alt="유기동물"
          onError={(e) => (e.target.src = "/noimage.png")}
        />
      </div>
      <div className="contents">
        <div className="contents-t1">
          <p className="petType">{petType}</p>
          <p>{petGender}</p>
          <p>{petName}</p>
        </div>
        <p className="contents-t2">{petAge}(년생)</p>
        <div className="contents-t3">
          <p>실종일자 : {petMissingDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ShelterAnimalItem;
