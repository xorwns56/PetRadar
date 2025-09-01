import "../style/Header.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const Header = ({ leftChild }) => {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  const { isAuthenticated, api } = useAuth();
  const [alerts, setAlerts] = useState(null);
    // useEffect 훅을 사용하여 컴포넌트가 처음 마운트될 때 API를 호출
    useEffect(() => {
      // 사용자가 인증되었을 때만 API를 호출
      if (isAuthenticated) {
          const fetchNotification = async () => {
              try{
                  const response = api.get("/api/notification/me");
                  console.log(response.data);
              } catch (error) {
                  console.error("Failed to fetch notification : ", error);
              }
          };
          fetchNotification();
      }
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
