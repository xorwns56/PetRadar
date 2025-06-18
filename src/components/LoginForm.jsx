import { useState } from "react";
import "../style/LoginForm.css";

const LoginForm = ({ onCreate }) => {
  const onSubmit = (event) => {
    event.preventDefault();
    if (!input.id) {
      setErrorMsg("아이디를 입력해주세요");
      return;
    }
    if (!input.pw) {
      setErrorMsg("비밀번호를 입력해주세요");
      return;
    }
    const result = onCreate(input.id, input.pw);
    if (!result) {
      setErrorMsg(
        "아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요."
      );
      return;
    }
    //생성 성공, 메인 페이지 이동
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
  const [errorMsg, setErrorMsg] = useState("");
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
    <form onSubmit={onSubmit}>
      <div
        className={`input_item id ${focus.id ? "focus" : ""} ${
          input.id ? "on" : ""
        }`}
      >
        <input
          type="text"
          name="id"
          id="user_id"
          onChange={onChangeInput}
          onFocus={onFocus}
          onBlur={onBlur}
          value={input.id}
        />
        <label htmlFor="user_id">아이디</label>
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
      <div className={`error_message ${errorMsg ? "" : "hide"}`}>
        {errorMsg}
      </div>
      <button type="submit" className="btn_login">
        로그인
      </button>
    </form>
  );
};
export default LoginForm;
