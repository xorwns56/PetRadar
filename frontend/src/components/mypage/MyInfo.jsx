import { useEffect, useState } from "react";
import Button from "../ui/Button";
import FormField, { controlClass } from "../ui/FormField";
import { toMessage } from "../../utils/error";

const MyInfo = ({ userInfo, onUpdate, onDelete, onLogOut }) => {
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState({ hp: "", newPw: "", currentPw: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    initInput();
    setError("");
  }, [userInfo]);

  // 입력칸만 되돌린다. 오류 문구까지 지우면 실패 직후 사유를 보여줄 수 없다 —
  // onConfirm이 setError 바로 뒤에 이걸 부르기 때문이다
  const initInput = () => {
    setInput({ hp: userInfo.hp ?? "", newPw: "", currentPw: "" });
  };

  const onChangeInput = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
    if (error) setError("");
  };

  // 비밀번호를 바꿀 때만 현재 비밀번호를 묻는다.
  // 연락처만 고치는 데 현재 비밀번호를 요구할 이유가 없다
  const changingPassword = input.newPw.trim().length > 0;

  const onConfirm = async () => {
    try {
      await onUpdate({
        hp: input.hp,
        newPw: input.newPw,
        currentPw: changingPassword ? input.currentPw : "",
      });
      setEditMode(false);
    } catch (err) {
      // 서버가 내려준 사유를 alert 대신 카드 안에서 보여준다
      setError(toMessage(err, "수정에 실패했어요. 다시 시도해주세요."));
      initInput();
    }
  };

  const row = "flex items-baseline gap-4";
  const term = "w-16 shrink-0 text-sm text-ink-muted";
  const desc = "truncate text-sm font-semibold text-ink";

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">회원 정보</h2>
        {!editMode && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onLogOut}>
              로그아웃
            </Button>
            <Button size="sm" onClick={() => setEditMode(true)}>
              정보수정
            </Button>
          </div>
        )}
      </div>

      {/* 아이디는 못 고치는 항목이지만 편집 중에도 계속 보여야
          어느 계정을 고치는 중인지 알 수 있다 */}
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className={row}>
          <dt className={term}>아이디</dt>
          <dd className={desc}>{userInfo.id}</dd>
        </div>
        {!editMode && (
          <div className={row}>
            <dt className={term}>연락처</dt>
            <dd className={desc}>{userInfo.hp}</dd>
          </div>
        )}
      </dl>

      {editMode && (
        <>
          {/* 입력칸까지 카드 폭(최대 768px)을 다 쓰면 한 줄이 지나치게 길어진다 */}
          <div className="mt-5 flex max-w-sm flex-col gap-4">
            <FormField label="연락처" htmlFor="myinfo-hp">
              <input
                id="myinfo-hp"
                type="tel"
                name="hp"
                value={input.hp}
                onChange={onChangeInput}
                className={controlClass}
              />
            </FormField>

            <FormField
              label="새 비밀번호"
              htmlFor="myinfo-new-pw"
              hint="바꾸지 않으려면 비워두세요."
            >
              <input
                id="myinfo-new-pw"
                type="password"
                name="newPw"
                autoComplete="new-password"
                value={input.newPw}
                onChange={onChangeInput}
                className={controlClass}
              />
            </FormField>

            {/* 새 비밀번호를 적기 전에는 띄우지 않는다.
                연락처만 고치러 온 사람에게 빈 칸이 하나 더 보이면
                그것도 채워야 하는 줄 안다 */}
            {changingPassword && (
              <FormField
                label="현재 비밀번호"
                htmlFor="myinfo-current-pw"
                hint="본인 확인을 위해 필요해요."
              >
                <input
                  id="myinfo-current-pw"
                  type="password"
                  name="currentPw"
                  autoComplete="current-password"
                  value={input.currentPw}
                  onChange={onChangeInput}
                  className={controlClass}
                />
              </FormField>
            )}

            {error && (
              <p className="text-xs leading-relaxed font-semibold break-keep text-danger">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={onConfirm}>확인</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  initInput();
                }}
              >
                취소
              </Button>
            </div>
          </div>

          {/* 되돌릴 수 없는 동작이라 저장 버튼과 떼어 놓는다 */}
          <div className="mt-8 border-t border-line pt-4">
            <Button variant="danger" size="sm" onClick={onDelete}>
              회원 탈퇴
            </Button>
          </div>
        </>
      )}
    </section>
  );
};

export default MyInfo;
