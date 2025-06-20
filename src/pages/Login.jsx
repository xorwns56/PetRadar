import { Link } from "react-router-dom";
import "../style/Login.css";
import LoginForm from "../components/LoginForm";
const Login = () => {
  return (
    <>
      <div className="Login">
        <div className="header">로고</div>
        <div className="content">
          <LoginForm />
          <Link className="register" to="/register">
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
};
export default Login;
