import "../style/MyPage.css";
import Header from "../components/Header";
import MyInfo from "../components/MyInfo";
import MyPost from "../components/MyPost";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
const MyPage = () => {
  const nav = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const { api } = useAuth();
  useEffect(() => {
      const fetchMe = async () => {
          try {
            const response = await api.get("/api/user/me");
            setUserInfo({
                id : response.data.loginId,
                hp : response.data.hp
            });
          } catch (error) {
            console.error("Failed to fetch me:", error);
          }
        };
        fetchMe();
  }, []);

  const onUpdate = (pw, hp) => {
      /*
    userDispatch({
      type: "UPDATE",
      data: {
        id: userInfo.id,
        pw,
        hp,
      },
    });
    */
  };
  const onDelete = () => {
      /*
    if (confirm("탈퇴 시 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
      userDispatch({
        type: "DELETE",
        data: {
          id: userInfo.id,
        },
      });
      missingDispatch({
        type: "DELETE_USER_DATA",
        data: {
          id: userInfo.id,
        },
      });
      reportDispatch({
        type: "DELETE_USER_DATA",
        data: {
          id: userInfo.id,
        },
      });
      onLogOut();
    }
    */
  };

  const onLogOut = () => {
      /*
    userDispatch({
      type: "LOGOUT",
    });
    */
  };

  return (
    <div className="MyPage">
      <Header rightChild={"child"} />
      <div className="MyPage-container inner">
        <div className="MyInfo-container">
          <MyInfo
            userInfo={userInfo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onLogOut={onLogOut}
          />
        </div>
{/*         <MyPost id={userState.currentUser} /> */}
      </div>
    </div>
  );
};
export default MyPage;
