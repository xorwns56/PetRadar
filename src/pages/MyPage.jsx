import "../style/MyPage.css";
import Header from "../components/Header";
import MyInfo from "../components/MyInfo";
import MyPost from "../components/MyPost";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
import { useReportDispatch } from "../contexts/ReportContext";
import { useMissingDispatch } from "../contexts/MissingContext";
const MyPage = () => {
  const nav = useNavigate();
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const missingDispatch = useMissingDispatch();
  const reportDispatch = useReportDispatch();
  useEffect(() => {
    if (!userState.currentUser) {
      nav("/", { replace: true });
    }
  }, [userState.currentUser, nav]);
  const userInfo = userState.users.find(
    (user) => user.id === userState.currentUser
  );
  const onUpdate = (pw, hp) => {
    userDispatch({
      type: "UPDATE",
      data: {
        id: userInfo.id,
        pw,
        hp,
      },
    });
  };
  const onDelete = () => {
    if (confirm("탈퇴 시 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
      userDispatch({
        type: "DELETE",
        data: {
          id: userInfo.id,
        },
      });
      missingDispatch({
        type: "CLEAR_USER_DATA",
        data: {
          id: userInfo.id,
        },
      });
      reportDispatch({
        type: "CLEAR_USER_DATA",
        data: {
          id: userInfo.id,
        },
      });
      onLogOut();
    }
  };

  const onLogOut = () => {
    userDispatch({
      type: "LOGOUT",
    });
  };

  return (
    <div className="MyPage">
      <Header rightChild={"child"} />
      <div className="MyPage-container inner">
        <div className="MyInfo-container">
          <MyInfo
            {...userInfo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onLogOut={onLogOut}
          />
        </div>
        <MyPost id={userState.currentUser} />
      </div>
    </div>
  );
};
export default MyPage;
