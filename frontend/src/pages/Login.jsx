import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const nav = useNavigate();
  const { login, api } = useAuth();

  const isExist = async (id) => {
    try {
      const response = await api.get("/api/auth/check-exist", {
        params: { id },
      });
      return response.data;
    } catch (error) {
      console.error("isExist : ", error);
      return false;
    }
  };

  const onLogin = async (id, pw) => {
    try {
      const response = await api.post("/api/auth/login", { id, pw });
      if (response.status === 200) {
        login(response.data.accessToken);
        nav("/", { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      // 자격 증명이 틀린 경우가 대부분이라 alert 대신 폼 안에서 알린다
      console.error("Login error:", error);
      return false;
    }
  };

  return (
    <AuthLayout
      title="로그인"
      description="실종 신고와 목격 제보를 하려면 로그인이 필요해요."
      footer={
        <p className="text-center text-sm text-ink-muted">
          아직 계정이 없으신가요?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-ink underline underline-offset-4 hover:text-brand"
          >
            회원가입
          </Link>
        </p>
      }
    >
      <LoginForm isExist={isExist} onLogin={onLogin} />
    </AuthLayout>
  );
};

export default Login;
