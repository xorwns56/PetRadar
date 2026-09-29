import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportAlertBox from "../notification/ReportAlertBox";
import MissingAlertBox from "../notification/MissingAlertBox";
import ShelterAlertBox from "../notification/ShelterAlertBox";
import { useSidebar } from "../../contexts/SidebarContext";
import { deleteNotification } from "../../api/notification";
import { cn } from "../../utils/cn";

/* 알림 서랍.
   예전에는 #root 안에서 position:absolute로 밀어 두고 overflow:hidden에 기대
   가렸다. 그래서 #root의 폭·overflow를 건드리면 같이 깨졌고, 페이지를 따라
   스크롤돼 아래로 내려가면 서랍이 화면 밖에 있었다.
   화면 기준(fixed)으로 띄우고 뒤 배경을 덮어, 어느 화면에서 열어도 같게 만든다.
   전환도 1초에서 0.3초로 줄였다 — 1초는 눌러 놓고 기다리는 느낌이었다. */
const SideBar = () => {
  const nav = useNavigate();
  const { isActive, toggleSidebar, alerts, setAlerts } = useSidebar();

  // 열려 있는 동안 Esc로 닫고, 뒤 화면이 같이 스크롤되지 않게 막는다
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") toggleSidebar();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isActive, toggleSidebar]);

  const onAlertClose = async (id) => {
    try {
      await deleteNotification(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <>
      {/* 배경 덮개 */}
      <div
        onClick={toggleSidebar}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          isActive ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-label="알림"
        aria-hidden={!isActive}
        className={cn(
          "fixed top-0 right-0 z-50 flex h-dvh w-full flex-col bg-page shadow-2xl sm:max-w-[380px]",
          "transition-transform duration-300 ease-out",
          isActive ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-base font-bold text-ink">
            알림
            {alerts.length > 0 && (
              <span className="ml-2 text-brand">{alerts.length}</span>
            )}
          </h2>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={toggleSidebar}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            ✕
          </button>
        </div>

        <div className="scroll-visible flex-1 overflow-y-auto p-4">
          {alerts.length === 0 ? (
            <p className="mt-16 text-center text-sm text-ink-muted">
              아직 받은 알림이 없어요.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => {
                const key = `${alert.postType}_${alert.id}`;
                const close = () => onAlertClose(alert.id);

                if (alert.postType === "missing") {
                  return (
                    <MissingAlertBox
                      key={key}
                      {...alert}
                      onAlertClick={() => nav("/missingList")}
                      onAlertClose={close}
                    />
                  );
                }
                if (alert.postType === "shelter") {
                  // postId가 내 실종 글이다. 거기 후보 목록이 붙어 있다
                  return (
                    <ShelterAlertBox
                      key={key}
                      preview={alert.preview}
                      onAlertClick={() => nav(`/missing/${alert.postId}`)}
                      onAlertClose={close}
                    />
                  );
                }
                return (
                  <ReportAlertBox
                    key={key}
                    senderId={alert.senderId}
                    preview={alert.preview}
                    onAlertClick={() => nav("/myPage")}
                    onAlertClose={close}
                  />
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
