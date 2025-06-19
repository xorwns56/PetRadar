import "../style/home.css";
import Header from "../components/Header";
import Map from "../components/Map";
import MainMenu from "../components/MainMenu";
import SideBar from "../components/SideBar";

const Home = () => {
  return (
    <div className="Home">
      <Header rightChild={"로그인/회원가입"} />
      <div className="main-container">
        <div className="menu-title">
          <h2>길 잃은 아이를 바로 신고해주세요.</h2>
          <p>간편한 원터치 기능으로 주변에 있는 보호소로 자동신고가 되요!</p>
        </div>
        <Map />
        <div style={{border:"1px solid #FDC830",borderRadius:"30px", width:"100%", height:"400px"}}></div>

        <div className="mainMenu-container">
          <MainMenu mainTitle={"신고"} subTitle={"사라진 친구를 찾아주세요."} />
          <MainMenu mainTitle={"보호소"} subTitle={"보호소를 확인해보세요."} />
          <MainMenu
            mainTitle={"실종동물 보기"}
            subTitle={"실종된 친구들을 확인해보세요."}
          />
        </div>
      </div>
      <SideBar />
    </div>
  );
};
export default Home;
