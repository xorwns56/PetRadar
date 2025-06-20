import "../style/MyPage.css";
import Header from "../components/Header";
import MyInfo from "../components/MyInfo";
import MyPost from "../components/MyPost";
const MyPage = () => {
  return (
    <div className="MyPage">
      <Header rightChild={"child"} />
      <div className="container">
        <MyInfo />
        <MyPost />
      </div>
    </div>
  );
};
export default MyPage;
