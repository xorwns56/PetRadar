const ShelterDetail = ({ shelter }) => {
  const defaultImg = "/enhanced_image_1.png";
  if (!shelter) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "320px",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <div style={{ background: "#eee", height: "180px" }}>
        <img
          src={shelter.THUMB_IMAGE_COURS || defaultImg}
          alt={shelter.SHTER_NM}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "8px 0", fontWeight: "bold" }}>
          {shelter.SHTER_NM}
        </h3>
        <p style={{ margin: "4px 0" }}>📞 {shelter.SHTER_TELNO}</p>
        <p style={{ margin: "4px 0" }}>
          📍 {shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}
        </p>

        {shelter.HOMEPAGE && (
          <p style={{ marginTop: "8px" }}>
            🌐{" "}
            <a
              href={shelter.HOMEPAGE}
              target="_blank"
              rel="noopener noreferrer"
            >
              홈페이지 바로가기
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ShelterDetail;
