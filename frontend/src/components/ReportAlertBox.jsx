import AlertBox from "./AlertBox";

const ReportAlertBox = ({ currentUser, senderId, onAlertClick, onAlertClose }) => (
  <AlertBox
    icon="🐾"
    title={`${currentUser}님의 실종 동물을 ${senderId || "펫레이더 이웃"}님이 목격했다고 제보가 왔어요!`}
    description="지금 바로 확인해보세요. 작은 제보가 큰 단서가 될 수 있어요."
    onAlertClick={onAlertClick}
    onAlertClose={onAlertClose}
  />
);

export default ReportAlertBox;
