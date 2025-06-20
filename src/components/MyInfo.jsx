import { useState } from "react";
import { useLoginUser } from "../contexts/LoginUserContext";
import { useUsersDispatch, useUsersState } from "../contexts/UsersContext";
import "../style/MyInfo.css";
const MyInfo = () => {
  const usersState = useUsersState();
  const usersDispatch = useUsersDispatch();
  const { loginUserId } = useLoginUser();

  let user = usersState.find((user) => user.id === loginUserId);
  if (!user) user = {};
  const [input, setInput] = useState({
    pw: user.pw,
    hp: user.hp,
    isVisible: false,
  });
  const UpdateUser = () => {
    usersDispatch({
      type: "UPDATE",
      data: {
        ...user,
        hp: input.hp,
      },
    });
  };
  const DeleteUser = () => {
    var result = confirm("정말 회원탈퇴하시겠습니까?");
    if (result) {
      usersDispatch({
        type: "DELETE",
        data: {
          id: loginUserId,
        },
      });
    }
  };
  return (
    <div className="MyInfo">
      <h2 className="title">회원 정보</h2>
      <div className="content">
        <table className="info">
          <tbody>
            <tr>
              <th>아이디</th>
              <td>{user.id}</td>
            </tr>
            {input.isVisible ? (
              <>
                <tr>
                  <th>비밀번호</th>
                  <td>
                    <input value={user.pw} />
                  </td>
                </tr>
                <tr>
                  <th>연락처</th>
                  <td>
                    <input value={user.hp} />
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <th>연락처</th>
                <td>{user.hp}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="btn">
          <button onClick={() => setInput({ ...input, isVisible: true })}>
            정보 수정
          </button>
          <button onClick={DeleteUser}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
