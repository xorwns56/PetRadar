import '../style/AlertBox.css';
import { useNavigate } from 'react-router-dom';

const ReportAlertBox = () => {
  const nav = useNavigate();

  return (
    <div className="AlertBox">
      <div
        className="AlertBox-container"
        onClick={() => {
          nav('/myPage');
        }}
      >
        <div className="alert-icon">
          <img src="/alertIcon.png" alt="alertIcon" />
        </div>
        <div className="alert-message">
          <h3>🐾 펫레이더 이웃이 님의 실종 동물을 봤다고 제보했어요!</h3>
          <p>지금 바로 확인해보세요. 작은 제보가 큰 단서가 될 수 있어요.</p>
        </div>
      </div>
      <div className="alert-close">✕</div>
    </div>
  );
};
export default ReportAlertBox;
