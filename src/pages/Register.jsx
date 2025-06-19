import { useState } from "react";
import "../style/Register.css";
import RegisterForm from "../components/RegisterForm";

const Register = () => {
  const [users, setUsers] = useState([]);
  const isExist = (id) => {
    return users.some((user) => user.id === id);
  };
  const onRegister = (id, pw, hp) => {
    if (isExist(id)) return false;
    setUsers([...users, { id, pw, hp }]);
    return true;
  };

  return (
    <div className="Register">
      <div className="header">로고</div>
      <RegisterForm
        className="content"
        onRegister={onRegister}
        isExist={isExist}
      />
    </div>
  );
};
export default Register;
