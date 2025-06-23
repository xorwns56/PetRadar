import '../style/AlertBox.css';
import { useNavigate } from 'react-router-dom';

const MissingAlertBox = () => {
  const nav = useNavigate();

  return (
    <div className="AlertBox">
      <div
        className="AlertBox-container"
        onClick={() => {
          nav('/missingList');
        }}
      >
        <div className="alert-icon">
          <img src="/alertIcon.png" alt="alertIcon" />
        </div>
        <div className="alert-message">
          <h3>🚨 펫레이더 이웃이 당신 근처에서 실종 신고를 했어요.</h3>
          <p>빠른 관심과 도움이 필요합니다.</p>
        </div>
      </div>
      <div className="alert-close">✕</div>
    </div>
  );
};
export default MissingAlertBox;
