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

  const onUpdate = async ({ hp, newPw, currentPw }) => {
    try {
      await updateMe({ hp, newPw, currentPw });
      // 비밀번호는 화면에 두지 않는다. 바뀐 건 연락처뿐이다
      setUserInfo((prevUserInfo) => ({ ...prevUserInfo, hp }));
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
