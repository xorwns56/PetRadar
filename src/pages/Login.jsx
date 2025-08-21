import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import LoginForm from "../components/LoginForm";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
import { useEffect } from "react";
import api from "../api/api";
const Login = () => {
  const nav = useNavigate();
  /*
  useEffect(() => {
    if (userState.currentUser) {
      nav("/", { replace: true });
    }
  }, [userState.currentUser, nav]);
  */
  const isExist = async (id) => {
      try {
        const response = await api.get("/api/user/check-exist", { params : {id} });
        return response.data;
      } catch (error) {
        console.error("isExist : ", error);
        return false;
      }
    };
  const onLogin = async (id, pw) => {
    try {
      const response = await api.post("/api/auth/login", {
        id,
        pw,
      });
      if (response.status === 200) {
        api.login(response.data.accessToken);
        console.log(api.isAuthenticated);
        console.log(response.data.accessToken);
        nav("/", { replace: true });
        return true;
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      } else {
        alert("로그인 중 오류가 발생했습니다.");
        console.error("Login error:", error);
      }
      return false;
    }
  };
  /*
  const onLoginCheck = (id, pw) => {
    return userState.users.some((user) => user.id === id && user.pw === pw);
  };
  const onLoginSuccess = (id) => {
    userDispatch({
      type: "LOGIN",
      data: {
        id,
      },
    });
    nav("/", { replace: true });
  };
  */
  return (
    <>
      <div className="Login">
        <div className="Login-container">
          <div className="logo">
            <Link to="/">
              <img className="logo" src="/PetRadar-Logo-m.png" />
            </Link>
          </div>
          <div className="Login-contents">
            <LoginForm
              isExist={isExist}
              onLogin={onLogin}
            />
            <div className="register-btn">
              <Link className="register" to="/register">
                회원가입 →
              </Link>
            </div>
            <div className="login-img">
              <img src="/Menu-icon1.png" alt="login-img" />
            </div>
          </div>
        </div>
        <div className="bg-icons">
          <img className="bg-icon bg-icon1" src="/bg-icon.png" alt="bg-icon1" />
          <img className="bg-icon bg-icon2" src="/bg-icon.png" alt="bg-icon1" />
          <img className="bg-icon bg-icon3" src="/bg-icon.png" alt="bg-icon1" />
        </div>
      </div>
    </>
  );
};
export default Login;
