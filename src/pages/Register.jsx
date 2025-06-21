import '../style/Register.css';
import RegisterForm from '../components/RegisterForm';
import { useUserDispatch, useUserState } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const Register = () => {
  const nav = useNavigate();
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  useEffect(() => {
    if (userState.currentUser) {
      nav('/', { replace: true });
    }
  }, [userState.currentUser, nav]);
  const isExist = (id) => {
    return userState.users.some((user) => user.id === id);
  };
  const onCreate = (id, pw, hp) => {
    userDispatch({
      type: 'CREATE',
      data: {
        id,
        pw,
        hp,
      },
    });
  };
  const onRegister = () => {
    nav('/login', { replace: true });
  };
  return (
    <div className="Register">
      <div className="Register-container">
        <div className="logo">
          <Link to="/">
            <img className="logo" src="/PetRadar-Logo-m.png" />
          </Link>
        </div>
        <div className="Register-contents">
          <RegisterForm isExist={isExist} onCreate={onCreate} onRegister={onRegister} />
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
  );
};
export default Register;
