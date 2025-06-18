import { useState } from "react";
import "../style/Login.css";
import LoginForm from "../components/LoginForm";

const mockData = [
  {
    id: "admin",
    pw: "admin",
  },
];

const Login = () => {
  const [users, setUsers] = useState(mockData);
  const onCreate = (id, pw) => {
    setUsers([...users, { id, pw }]);
  };

  return (
    <>
      <div className="container">
        <div className="header">로고</div>
        <div className="content">
          <LoginForm onCreate={onCreate} />
          <div className="register">회원가입</div>
        </div>
      </div>
    </>
  );
};
export default Login;
