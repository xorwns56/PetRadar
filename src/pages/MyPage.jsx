import "../style/MyPage.css";
import Header from "../components/Header";
import MyInfo from "../components/MyInfo";
import MyPost from "../components/MyPost";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
const MyPage = () => {
  const nav = useNavigate();
  const userState = useUserState();
  const userDispatch = useUserDispatch();

  useEffect(() => {
    if (!userState.currentUser) {
      nav("/login", { replace: true });
    }
  }, [userState.currentUser, nav]);

  const info = userState.users.find(
    (user) => user.id === userState.currentUser
  );
  const onUpdate = (pw, hp) => {
    userDispatch({
      type: "UPDATE",
      data: {
        id: info.id,
        pw,
        hp,
      },
    });
  };

  const onDelete = () => {
    //컨펌 받자
    userDispatch({
      type: "DELETE",
      data: {
        id: info.id,
      },
    });
    userDispatch({
      type: "LOGOUT",
    });
  };

  return (
    <div className="MyPage">
      <Header rightChild={"child"} />
      <div className="container">
        <MyInfo {...info} onUpdate={onUpdate} onDelete={onDelete} />
        <MyPost />
      </div>
    </div>
  );
};
export default MyPage;
