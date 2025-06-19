import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginForm.css";
import { useUsersState } from "../contexts/UsersContext";
import { useLoginUser } from "../contexts/LoginUserContext";
const LoginForm = () => {
  const usersState = useUsersState();
  const { login } = useLoginUser();
  const nav = useNavigate();
  const Login = (id, pw) => {
    return usersState.find((user) => user.id === id && user.pw === pw);
  };
  const onSubmit = (event) => {
    event.preventDefault();
    if (!input.id) {
      setErrMsg("아이디를 입력해주세요.");
      return;
    }
    if (!input.pw) {
      setErrMsg("비밀번호를 입력해주세요.");
      return;
    }
    const user = Login(input.id, input.pw);
    if (!user) {
      setErrMsg(
        "아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요."
      );
      return;
    }
    login(input.id);
    nav("/", { replace: true });
  };
  const [focus, setFocus] = useState({
    id: false,
    pw: false,
  });
  const [input, setInput] = useState({
    id: "",
    pw: "",
  });
  const [pwHide, setPwHide] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const onChangeInput = (event) => {
    setInput({
      ...input,
      [event.target.name]: event.target.value,
    });
  };
  const onDeleteInput = (name) => {
    setInput({
      ...input,
      [name]: "",
    });
  };
  const onFocus = (event) => {
    setFocus({
      ...focus,
      [event.target.name]: true,
    });
  };
  const onBlur = (event) => {
    setFocus({
      ...focus,
      [event.target.name]: false,
    });
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div
        className={`input_item id ${focus.id ? "focus" : ""} ${
          input.id ? "on" : ""
        }`}
      >
        <input
          type="text"
          name="id"
          id="login_id"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.id}
        />
        <label htmlFor="login_id">아이디</label>
        <button
          type="button"
          className={`btn_delete ${input.id ? "" : "hide"}`}
          onClick={() => {
            onDeleteInput("id");
          }}
        ></button>
      </div>
      <div
        className={`input_item pw ${focus.pw ? "focus" : ""} ${
          input.pw ? "on" : ""
        }`}
      >
        <input
          type={pwHide ? "password" : "text"}
          name="pw"
          id="user_pw"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.pw}
        />
        <label htmlFor="user_pw">비밀번호</label>
        <button
          type="button"
          className={`btn_view ${input.pw ? "" : "hide"}`}
          onClick={() => {
            setPwHide(!pwHide);
          }}
        ></button>
        <button
          type="button"
          className={`btn_delete ${input.pw ? "" : "hide"}`}
          onClick={() => {
            onDeleteInput("pw");
          }}
        ></button>
      </div>
      <div className={`error_message ${errMsg ? "" : "hide"}`}>{errMsg}</div>
      <button
        type="submit"
        className={`btn_login ${input.id && input.pw ? "on" : ""}`}
      >
        로그인
      </button>
    </form>
  );
};
export default LoginForm;
