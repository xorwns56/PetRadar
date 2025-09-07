import "../style/Header.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const Header = ({ leftChild }) => {
  const { toggleSidebar, alerts } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  const { isAuthenticated, api, socket } = useAuth();
    // useEffect 훅을 사용하여 컴포넌트가 처음 마운트될 때 API를 호출
    /*
    useEffect(() => {
        if(!isAuthenticated) return;
        const fetchNotification = async () => {
          try{
              const response = await api.get("/api/notification/me");
              console.log(response.data);
          } catch (error) {
              console.error("Failed to fetch notification : ", error);
          }
        };
        fetchNotification();
    }, [isAuthenticated]);
*/

/*
    useEffect(() => {
        if(!socket) return;
        const subscription = socket.subscribe("/user/queue/notification", (message) => {
          const data = JSON.parse(message.body);
          console.log("새 알림:", data);
          //setAlerts((prev) => (prev || 0) + 1); // 카운트 증가 예시
        });
        return () => {
            console.log("구독 해제");
          subscription.unsubscribe();
        };

    }, [socket]);
*/

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
              <span className="Msg-cnt">{alerts.length}</span>
            )}
          </p>
        )}
      </div>
    </header>
  );
};
export default Header;
