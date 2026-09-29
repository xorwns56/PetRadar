import AlertBox from "../ui/AlertBox";

/* 보호소에 내 아이와 비슷한 아이가 들어왔을 때.
   sender가 없는 유일한 알림이다 — 사람이 아니라 공공 데이터에서 온다.

   preview는 알림을 조회하는 시점에 공공 목록에서 찾아 붙인 것이라,
   이미 입양·반환된 아이는 비어 있다. 그때는 사진 없이 기본 문구만 둔다 */
const ShelterAlertBox = ({ preview, onAlertClick, onAlertClose }) => (
  <AlertBox
    icon="🏠"
    thumbnail={preview?.thumbnailUrl}
    title="보호소에 비슷한 아이가 들어왔어요."
    description={
      preview
        ? `${preview.title} · ${preview.subtitle}에서 발견됐어요.`
        : "사진을 확인해보세요. 공고 기간이 지나면 처리가 달라질 수 있어요."
    }
    onAlertClick={onAlertClick}
    onAlertClose={onAlertClose}
  />
);

export default ShelterAlertBox;
