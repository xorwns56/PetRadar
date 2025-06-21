import "../style/Register.css";
import RegisterForm from "../components/RegisterForm";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
const Register = () => {
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
  const onCreate = (id, pw, hp) => {
    userDispatch({
      type: "CREATE",
      data: {
        id,
        pw,
        hp,
      },
    });
  };
  const onRegister = () => {
    nav("/login", { replace: true });
  };
  return (
    <div className="Register">
      <div className="header">
        <Link to="/">
          <img className="logo" src="/PetRadar-Logo.png" />
        </Link>
      </div>
      <div className="content">
        <RegisterForm
          isExist={isExist}
          onCreate={onCreate}
          onRegister={onRegister}
        />
      </div>
    </div>
  );
};
export default Register;
