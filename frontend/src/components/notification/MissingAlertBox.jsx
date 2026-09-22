import AlertBox from "../ui/AlertBox";

const MissingAlertBox = ({ senderId, onAlertClick, onAlertClose }) => (
  <AlertBox
    icon="🚨"
    title={`${senderId}님이 당신 근처에서 실종 신고를 했어요.`}
    description="빠른 관심과 도움이 필요합니다."
    onAlertClick={onAlertClick}
    onAlertClose={onAlertClose}
  />
);

export default MissingAlertBox;
