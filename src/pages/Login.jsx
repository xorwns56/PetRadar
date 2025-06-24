import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import LoginForm from "../components/LoginForm";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
import { useEffect } from "react";
const Login = () => {
  const nav = useNavigate();
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  useEffect(() => {
    if (userState.currentUser) {
      nav("/", { replace: true });
    }
  }, [userState.currentUser, nav]);
  const isExist = (id) => {
    return userState.users.some((user) => user.id === id);
  };
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
              onLoginCheck={onLoginCheck}
              onLoginSuccess={onLoginSuccess}
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
