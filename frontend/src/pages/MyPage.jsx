import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import MyInfo from "../components/mypage/MyInfo";
import MyPost from "../components/mypage/MyPost";
import { useAuth } from "../contexts/AuthContext.jsx";
import { deleteMe, fetchMe, updateMe } from "../api/user";
import { toMessage } from "../utils/error";

const MyPage = () => {
  const nav = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const { logout } = useAuth();

  useEffect(() => {
    fetchMe()
      .then((data) => setUserInfo({ id: data.loginId, hp: data.hp }))
      .catch((error) => console.error("Failed to fetch me:", error));
  }, []);

  const onUpdate = async (pw, hp) => {
    try {
      await updateMe({ pw, hp });
      setUserInfo((prevUserInfo) => ({ ...prevUserInfo, pw, hp }));
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const onDelete = async () => {
    if (confirm("탈퇴 시 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
      try {
        await deleteMe();
        onLogOut();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert(toMessage(error, "탈퇴에 실패했습니다."));
      }
    }
  };

  const onLogOut = () => {
    logout();
    nav("/");
  };

  return (
    <Layout width="content">
      <PageHeading title="마이페이지" />

      {/* 위아래로 쌓는다. 회원 정보를 옆 320px 기둥에 넣어 봤더니
          정보수정으로 들어갔을 때 입력칸이 갑갑했다 */}
      <div className="flex flex-col gap-10">
        <MyInfo
          userInfo={userInfo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onLogOut={onLogOut}
        />
        <MyPost />
      </div>
    </Layout>
  );
};

export default MyPage;
