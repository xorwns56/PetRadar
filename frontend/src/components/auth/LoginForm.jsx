import { useState } from "react";
import Button from "../ui/Button";
import FloatingField, { FieldIconButton } from "../ui/FloatingField";

const LoginForm = ({ isExist, onLogin }) => {
  const [input, setInput] = useState({ id: "", pw: "" });
  const [pwHide, setPwHide] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChangeInput = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
    // 값을 고치기 시작하면 지난 오류 문구는 치운다
    if (errMsg) setErrMsg("");
  };

  const onDeleteInput = (name) => setInput({ ...input, [name]: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!input.id) {
      setErrMsg("아이디를 입력해주세요.");
      return;
    }
    if (!input.pw) {
      setErrMsg("비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      if (!(await isExist(input.id))) {
        setErrMsg("없는 회원입니다.");
        return;
      }
      if (!(await onLogin(input.id, input.pw))) {
        setErrMsg(
          "아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="flex flex-col gap-3">
      <FloatingField
        id="login_id"
        name="id"
        type="text"
        label="아이디"
        value={input.id}
        onChange={onChangeInput}
        trailing={
          input.id && (
            <FieldIconButton
              label="아이디 지우기"
              icon="/deleteIcon.png"
              onClick={() => onDeleteInput("id")}
            />
          )
        }
      />

      <FloatingField
        id="user_pw"
        name="pw"
        type={pwHide ? "password" : "text"}
        label="비밀번호"
        value={input.pw}
        onChange={onChangeInput}
        trailing={
          input.pw && (
            <>
              <FieldIconButton
                label={pwHide ? "비밀번호 보기" : "비밀번호 가리기"}
                icon={`/${pwHide ? "close" : "open"}EyeIcon.png`}
                onClick={() => setPwHide(!pwHide)}
              />
              <FieldIconButton
                label="비밀번호 지우기"
                icon="/deleteIcon.png"
                onClick={() => onDeleteInput("pw")}
              />
            </>
          )
        }
      />

      {errMsg && (
        <p className="px-1 text-xs leading-relaxed font-semibold break-keep text-danger">
          {errMsg}
        </p>
      )}

      <Button
        htmlType="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={submitting || !input.id || !input.pw}
      >
        {submitting ? "확인 중…" : "로그인"}
      </Button>
    </form>
  );
};

export default LoginForm;
