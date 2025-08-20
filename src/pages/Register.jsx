import '../style/Register.css';
import RegisterForm from '../components/RegisterForm';
import { useUserDispatch, useUserState } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from "../api/api";
const Register = () => {
  const nav = useNavigate();
  /*
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  useEffect(() => {
    if (userState.currentUser) {
      nav('/', { replace: true });
    }
  }, [userState.currentUser, nav]);
  */

  const isExist = async (id) => {
    try {
      const response = await api.get("/api/user/check-exist", { params : {id} });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const onRegister = async (id, pw, hp) => {
    try {
      await api.post("/api/user/register", { id, pw, hp });
      nav("/login", { replace: true });
    } catch (error) {
      // 에러 발생 시 처리
      if (error.response) {
        alert("회원가입에 실패했습니다. 입력 정보를 확인해주세요.");
      } else if (error.request) {
        alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert("예상치 못한 오류가 발생했습니다.");
      }
    }
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
          <RegisterForm isExist={isExist} onRegister={onRegister} />
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
