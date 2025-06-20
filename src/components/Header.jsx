import "../style/Header.css";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";

const Header = ({ leftChild }) => {
  const { toggleSidebar } = useSidebar();
  const nav = useNavigate();
  const isLogin = false;
  const goMyPage = () => {
    if (isLogin) {
      nav("/myPage");
    } else {
      nav("/login");
    }
  };

  return (
    <header className="Header">
      <div
        className="header_left"
        onClick={() => {
          nav(-1);
        }}
      >
        {leftChild ? <img src="/Prev-btn.png" alt="logo" /> : ""}
      </div>
      <div
        className="header_center"
        onClick={() => {
          nav("/");
        }}
      >
        <img src="/PetRadar-Logo.png" alt="logo" />
      </div>
      <div className="header_right">
        <p onClick={goMyPage}>{isLogin ? "마이페이지" : "로그인/회원가입"}</p>
        <p className="Msg-bell" onClick={toggleSidebar}></p>
      </div>
    </header>
  );
};
export default Header;
