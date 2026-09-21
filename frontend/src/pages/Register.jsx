import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const nav = useNavigate();
  const { api } = useAuth();

  const isExist = async (id) => {
    try {
      const response = await api.get("/api/auth/check-exist", {
        params: { id },
      });
      return response.data;
    } catch (error) {
      console.error("isExist : ", error);
      return true;
    }
  };

  // 성공 여부를 돌려줘야 폼이 실패를 화면에 띄울 수 있다
  const onRegister = async (id, pw, hp) => {
    try {
      await api.post("/api/auth/register", { id, pw, hp });
      nav("/login", { replace: true });
      return true;
    } catch (error) {
      console.error("onRegister : ", error);
      return false;
    }
  };

  return (
    <AuthLayout
      title="회원가입"
      description="아이디와 연락처만 있으면 바로 시작할 수 있어요."
      footer={
        <p className="text-center text-sm text-ink-muted">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-ink underline underline-offset-4 hover:text-brand"
          >
            로그인
          </Link>
        </p>
      }
    >
      <RegisterForm isExist={isExist} onRegister={onRegister} />
    </AuthLayout>
  );
};

export default Register;
