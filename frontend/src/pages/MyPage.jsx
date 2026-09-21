import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import MyInfo from "../components/MyInfo";
import MyPost from "../components/MyPost";
import { useAuth } from "../contexts/AuthContext.jsx";

const MyPage = () => {
  const nav = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const { api, logout } = useAuth();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/api/user/me");
        setUserInfo({ id: response.data.loginId, hp: response.data.hp });
      } catch (error) {
        console.error("Failed to fetch me:", error);
      }
    };
    fetchMe();
  }, []);

  const onUpdate = async (pw, hp) => {
    try {
      await api.patch("/api/user/me", { pw, hp });
      setUserInfo((prevUserInfo) => ({ ...prevUserInfo, pw, hp }));
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const onDelete = async () => {
    if (confirm("탈퇴 시 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
      try {
        await api.delete("/api/user/me");
        onLogOut();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("삭제에 실패했습니다.");
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
