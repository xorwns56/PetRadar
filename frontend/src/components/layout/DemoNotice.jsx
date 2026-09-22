import { useState } from "react";
import Button from "../ui/Button";

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
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={close}
    >
      {/* 안쪽을 눌렀을 때 배경 클릭으로 전파돼 닫히지 않게 막는다 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-notice-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-2xl"
      >
        <h2 id="demo-notice-title" className="text-lg font-bold text-ink">
          데모 페이지입니다
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          포트폴리오용으로 만든 데모이며 실제 서비스가 아닙니다.
          <br />
          등록된 내용은 예고 없이 삭제될 수 있으니
          <br />
          실제 개인정보나 연락처는 입력하지 말아주세요.
        </p>
        <Button className="mt-6 w-full" onClick={close}>
          확인
        </Button>
      </div>
    </div>
  );
};

export default DemoNotice;
