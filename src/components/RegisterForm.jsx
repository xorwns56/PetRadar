import { useNavigate } from "react-router-dom";
import "../style/RegisterForm.css";
import { useState } from "react";
const RegisterForm = ({ onRegister, isExist }) => {
  const nav = useNavigate();
  const onSubmit = (event) => {
    event.preventDefault();
    if (
      !input.id ||
      !input.pw ||
      !input.name ||
      errMsg.id ||
      errMsg.pw ||
      errMsg.name
    )
      //errMsg를 여기서 쓰면 안될거 같고 그냥 form check를 따로 만들어서 한꺼번에 에러 체크 후 포커스 잃을때 실행해야될듯?
      return;
    const result = onRegister(input.id, input.pw, input.name);
    if (!result) {
      console.log("등록 실패");
      return;
    }
    nav("/login", { replace: true });
  };
  const [focus, setFocus] = useState({
    id: false,
    pw: false,
    name: false,
  });
  const [input, setInput] = useState({
    id: "",
    pw: "",
    name: "",
  });
  const [errMsg, setErrMsg] = useState({
    id: "",
    pw: "",
    name: "",
  });
  const [pwHide, setPwHide] = useState(true);
  const onChangeInput = (event) => {
    setInput({
      ...input,
      [event.target.name]: event.target.value,
    });
  };
  const onFocus = (event) => {
    setFocus({
      ...focus,
      [event.target.name]: true,
    });
  };

  //onBlur일때 에러 체크를 해야한다.
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
        } ${errMsg.id ? "err" : ""}`}
      >
        <input
          type="text"
          name="id"
          id="register_id"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.id}
        />
        <label htmlFor="register_id">아이디</label>
      </div>

      <div
        className={`input_item pw ${focus.pw ? "focus" : ""} ${
          input.pw ? "on" : ""
        } ${errMsg.pw ? "err" : ""}`}
      >
        <input
          type="password"
          name="pw"
          id="register_pw"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.pw}
        />
        <label htmlFor="register_pw">비밀번호</label>
      </div>

      <div
        className={`input_item name ${focus.name ? "focus" : ""} ${
          input.name ? "on" : ""
        } ${errMsg.name ? "err" : ""}`}
      >
        <input
          type="text"
          name="name"
          id="register_name"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.name}
        />
        <label htmlFor="register_name">닉네임</label>
      </div>

      <div className={`error_message ${errMsg.id ? "" : "hide"}`}>
        {errMsg.id}
      </div>
      <div className={`error_message ${errMsg.pw ? "" : "hide"}`}>
        {errMsg.pw}
      </div>
      <div className={`error_message ${errMsg.name ? "" : "hide"}`}>
        {errMsg.name}
      </div>
      <button
        type="submit"
        className={`btn_login ${
          !input.id ||
          !input.pw ||
          !input.name ||
          errMsg.id ||
          errMsg.pw ||
          errMsg.name
            ? ""
            : "on"
        }`}
      >
        회원가입
      </button>
    </form>
  );
};
export default RegisterForm;
