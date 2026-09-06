import { useState } from "react";
import Button from "./Button";
import "../style/DemoNotice.css";

const STORAGE_KEY = "demoNoticeDismissed";

/**
 * 실제 운영 서비스가 아니라 포트폴리오 데모임을 알리는 안내.
 * sessionStorage에 기록하므로 새로고침이나 화면 이동에는 다시 뜨지 않고,
 * 탭을 닫았다 다시 들어오면 한 번 더 보여준다.
 */
const DemoNotice = () => {
  const [visible, setVisible] = useState(
    () => !sessionStorage.getItem(STORAGE_KEY)
  );

  if (!visible) return null;

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="DemoNotice-backdrop" onClick={close}>
      {/* 안쪽을 눌렀을 때 배경 클릭으로 전파돼 닫히지 않게 막는다 */}
      <div className="DemoNotice" onClick={(e) => e.stopPropagation()}>
        <h3>데모 페이지입니다</h3>
        <p>
          포트폴리오용으로 만든 데모이며 실제 서비스가 아닙니다.
          <br />
          등록된 내용은 예고 없이 삭제될 수 있으니
          <br />
          실제 개인정보나 연락처는 입력하지 말아주세요.
        </p>
        <Button text={"확인"} type={"Square"} onClick={close} />
      </div>
    </div>
  );
};

export default DemoNotice;
