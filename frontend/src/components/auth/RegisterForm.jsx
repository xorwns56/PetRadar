import { useState } from "react";
import Button from "../ui/Button";
import FloatingField, { FieldIconButton } from "../ui/FloatingField";

const ID_REGEX = /^[a-z0-9]*$/;
const PW_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const HP_REGEX = /^01[0-9]{1}-\d{3,4}-\d{4}$/;

const RegisterForm = ({ isExist, onRegister }) => {
  const [input, setInput] = useState({ id: "", pw: "", hp: "" });
  const [errMsg, setErrMsg] = useState({ id: "", pw: "", hp: "" });
  const [formError, setFormError] = useState("");
  const [pwHide, setPwHide] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formCheck = async (name) => {
    const newErrMsg = {};

    if (!input.id) {
      newErrMsg.id = "아이디를 입력해주세요.";
    } else if (!ID_REGEX.test(input.id)) {
      // 형식부터 보고 통과할 때만 중복 확인을 요청한다
      newErrMsg.id = "ID는 영문 소문자와 숫자만 입력 가능합니다.";
    } else if (await isExist(input.id)) {
      newErrMsg.id = "사용할 수 없는 아이디입니다. 다른 아이디를 입력해주세요.";
    }

    if (!input.pw) {
      newErrMsg.pw = "비밀번호를 입력해주세요.";
    } else if (!PW_REGEX.test(input.pw)) {
      newErrMsg.pw =
        "비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.";
    }

    if (!input.hp) {
      newErrMsg.hp = "연락처를 입력해주세요.";
    } else if (!HP_REGEX.test(input.hp)) {
      newErrMsg.hp = "올바른 연락처 형식을 입력해 주세요. (예: 010-1234-5678)";
    }

    setErrMsg(
      name ? { ...errMsg, [name]: newErrMsg[name] ?? "" } : { id: "", pw: "", hp: "", ...newErrMsg }
    );
    return Object.keys(newErrMsg).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (!(await formCheck())) return;
      // 실패하면 onRegister가 false를 돌려준다.
      // 예전에는 여기서 아무 일도 일어나지 않아 사용자가 이유를 알 수 없었다
      if ((await onRegister(input.id, input.pw, input.hp)) === false) {
        setFormError("회원가입에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeInput = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
    if (formError) setFormError("");
  };

  const onBlur = (event) => formCheck(event.target.name);

  const hasBlocking =
    !input.id || !input.pw || !input.hp || errMsg.id || errMsg.pw || errMsg.hp;

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="flex flex-col gap-3">
      <FloatingField
        id="register_id"
        name="id"
        type="text"
        label="아이디"
        value={input.id}
        error={errMsg.id}
        onChange={onChangeInput}
        onBlur={onBlur}
      />

      <FloatingField
        id="register_pw"
        name="pw"
        type={pwHide ? "password" : "text"}
        label="비밀번호"
        value={input.pw}
        error={errMsg.pw}
        onChange={onChangeInput}
        onBlur={onBlur}
        trailing={
          input.pw && (
            <FieldIconButton
              label={pwHide ? "비밀번호 보기" : "비밀번호 가리기"}
              icon={`/${pwHide ? "close" : "open"}EyeIcon.png`}
              onClick={() => setPwHide(!pwHide)}
            />
          )
        }
      />

      <FloatingField
        id="register_hp"
        name="hp"
        type="tel"
        label="연락처 (예: 010-1234-5678)"
        value={input.hp}
        error={errMsg.hp}
        onChange={onChangeInput}
        onBlur={onBlur}
      />

      {formError && (
        <p className="px-1 text-xs leading-relaxed font-semibold break-keep text-danger">
          {formError}
        </p>
      )}

      <Button
        htmlType="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={submitting || Boolean(hasBlocking)}
      >
        {submitting ? "처리 중…" : "회원가입"}
      </Button>
    </form>
  );
};

export default RegisterForm;
