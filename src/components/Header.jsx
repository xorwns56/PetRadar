import "../style/Header.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";
import { useUserState } from "../contexts/UserContext";

const Header = ({ leftChild }) => {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  const userState = useUserState();
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
            nav(userState.currentUser ? "/myPage" : "/login");
          }}
        >
          {userState.currentUser ? "마이페이지" : "로그인/회원가입"}
        </p>
        <p className="Msg-bell" onClick={toggleSidebar}>
          {/* 알림 갯수 표시 */}
          <span className="Msg-cnt">3</span>
        </p>
      </div>
    </header>
  );
};
export default Header;
