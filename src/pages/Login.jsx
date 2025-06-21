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
        <div className="header">
          <Link to="/">
            <img className="logo" src="/PetRadar-Logo.png" />
          </Link>
        </div>
        <div className="content">
          <LoginForm
            onLoginCheck={onLoginCheck}
            onLoginSuccess={onLoginSuccess}
          />
          <Link className="register" to="/register">
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
};
export default Login;
