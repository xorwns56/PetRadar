import AlertBox from "../ui/AlertBox";
import { withJosa } from "../../utils/pet-label";

/* 내 실종 글에 목격 제보가 달렸을 때.

   예전 문구는 받는 사람 아이디를 "${currentUser}님의 실종 동물을"로 넣어
   자기 아이디를 자기가 읽는 꼴이었고, 어느 글에 온 제보인지도 알 수 없었다.

   preview는 조회 시점에 찾아 붙인 것이라 제보가 지워졌으면 비어 있다. */
const ReportAlertBox = ({ senderId, preview, onAlertClick, onAlertClose }) => (
  <AlertBox
    icon="🐾"
    thumbnail={preview?.thumbnailUrl}
    title={
      preview?.subtitle
        ? `${preview.subtitle}${withJosa(preview.subtitle, "을/를")} 봤다는 제보가 왔어요.`
        : "목격 제보가 왔어요."
    }
    description={
      preview?.title
        ? `"${preview.title}" — ${senderId || "펫레이더 이웃"}님`
        : "지금 바로 확인해보세요. 작은 제보가 큰 단서가 될 수 있어요."
    }
    onAlertClick={onAlertClick}
    onAlertClose={onAlertClose}
  />
);

export default ReportAlertBox;
