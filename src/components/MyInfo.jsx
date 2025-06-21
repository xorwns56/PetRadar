import { useState } from "react";
import "../style/MyInfo.css";
const MyInfo = ({ id, pw, hp, onUpdate, onDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [pwHide, setPwHide] = useState(false);
  const [input, setInput] = useState({
    pw,
    hp,
  });
  const [focus, setFocus] = useState({
    pw: false,
    hp: false,
  });
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
  const onBlur = (event) => {
    //formCheck(event.target.name);
    setFocus({
      ...focus,
      [event.target.name]: false,
    });
  };
  return (
    <div className="MyInfo">
      <h2 className="title">회원 정보</h2>
      <div className="content">
        <table className="info">
          <tbody>
            <tr>
              <th>아이디</th>
              <td>{id}</td>
            </tr>
            {editMode ? (
              <>
                <tr>
                  <th>비밀번호</th>
                  <td>
                    <input
                      type={pwHide ? "password" : "text"}
                      name="pw"
                      onChange={onChangeInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      value={input.pw}
                    />
                  </td>
                </tr>
                <tr>
                  <th>연락처</th>
                  <td>
                    <input
                      type="text"
                      name="hp"
                      onChange={onChangeInput}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      value={input.hp}
                    />
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <th>연락처</th>
                <td>{hp}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="btn">
          {editMode ? (
            <>
              <button onClick={() => onUpdate(input.pw, input.hp)}>확인</button>
              <button onClick={() => setEditMode(false)}>취소</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)}>정보 수정</button>
              <button onClick={onDelete}>회원 탈퇴</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
