import "../style/AlertBox.css"

const AlertBox = () => {
  return (
    <div className="AlertBox">
      <div className="alert-icon">
        <img src="/alertIcon.png" alt="alertIcon" />
      </div>
      <div className="alert-message">
        <h3>🐾 누군가 님의 실종 반려동물을 본 것 같다는 제보가 등록되었어요. </h3>
        <p>희망을 놓지 마세요!</p>
      </div>
      <div className="alert-close">X</div>
    </div>
  );
};
export default AlertBox;
