import "../style/Register.css";
import RegisterForm from "../components/RegisterForm";

const Register = () => {
  return (
    <div className="Register">
      <div className="header">로고</div>
      <div className="content">
        <RegisterForm />
      </div>
    </div>
  );
};
export default Register;
