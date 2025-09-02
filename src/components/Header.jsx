import "../style/Header.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const Header = ({ leftChild }) => {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const [alerts, setAlerts] = useState(null);
    // useEffect 훅을 사용하여 컴포넌트가 처음 마운트될 때 API를 호출
    useEffect(() => {
        let eventSource;
      // 사용자가 인증되었을 때만 API를 호출
      if (isAuthenticated) {
          //api 호출(알림 받아오는 로직)
          eventSource = new EventSource(`/api/sse/${userId}`);

            eventSource.addEventListener("heartbeat", (event) => {
              console.log("heartbeat:", event.data);
            });

            eventSource.addEventListener("newPost", (event) => {
              console.log("알림:", event.data);

              // 알림 갯수 증가 (예: 새 글 알림 카운트)
              setAlerts((prev) => (prev ? prev + 1 : 1));
            });

            eventSource.onerror = (err) => {
              console.error("SSE 연결 오류", err);
              // 자동 재연결은 브라우저가 해주지만, 필요시 eventSource.close() 해도 됨
            };
      }
        return () => {
          if (eventSource) {
            eventSource.close();
            console.log("🔌 SSE 연결 해제");
          }
        };
    }, [isAuthenticated]);

  return (
    <header className="Header">
      <div className="header_left">
        {location.pathname === "/" ? (
          <></>
        ) : (
          <img
            src="/Prev-btn.png"
            alt="logo"
            onClick={() => {
              nav(-1);
            }}
          />
        )}
      </div>
      <div
        className="header_center"
        onClick={() => {
          nav("/");
        }}
      >
        <img src="/PetRadar-Logo-w.png" alt="logo" />
      </div>
      <div className="header_right">
        <p
          onClick={() => {
            nav(isAuthenticated ? "/myPage" : "/login");
          }}
        >
          {isAuthenticated ? "마이페이지" : "로그인/회원가입"}
        </p>
        {isAuthenticated && (
          <p className="Msg-bell" onClick={toggleSidebar}>
            {alerts && (
              <span className="Msg-cnt">{alerts}</span>
            )}
          </p>
        )}
      </div>
    </header>
  );
};
export default Header;
