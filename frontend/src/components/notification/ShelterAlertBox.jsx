import AlertBox from "../ui/AlertBox";

/* 보호소에 내 아이와 비슷한 아이가 들어왔을 때.
   sender가 없는 유일한 알림이다 — 사람이 아니라 공공 데이터에서 온다 */
const ShelterAlertBox = ({ onAlertClick, onAlertClose }) => (
  <AlertBox
    icon="🏠"
    title="보호소에 비슷한 아이가 들어왔어요."
    description="사진을 확인해보세요. 공고 기간이 지나면 처리가 달라질 수 있어요."
    onAlertClick={onAlertClick}
    onAlertClose={onAlertClose}
  />
);

export default ShelterAlertBox;
