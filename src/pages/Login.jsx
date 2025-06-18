import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/Login.css";
import LoginForm from "../components/LoginForm";

const mockData = [
  {
    id: "xorwns56",
    pw: "xorwns56",
  },
];

const Login = () => {
  const [users] = useState(mockData);
  const onLogin = (id, pw) => {
    return users.find((user) => user.id === id && user.pw === pw);
  };

  return (
    <>
      <div className="Login">
        <div className="header">로고</div>
        <div className="content">
          <LoginForm onLogin={onLogin} />
          <Link className="register" to="/register">
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
};
export default Login;
