import "../style/home.css";
import Header from "../components/Header";
import Map from "../components/Map";
import MainMenu from "../components/MainMenu";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const nav = useNavigate();

  return (
    <div className="Home ">
      <Header rightChild={"로그인/회원가입"} />
      <div className="main-container inner">
        <div className="menu-titleBox">
          <div className="menu-title">
            <h2>
              길 잃은 아이를 <br /> 바로 신고해주세요.
            </h2>
            <p>
              간편한 원터치 기능으로 <br />
              주변에 있는 보호소로 자동신고가 돼요!
            </p>
          </div>
          <img src="/Menu-icon1.png" alt="dogIcon" />
        </div>

        <div className="mainMenu-container">
          <MainMenu
            imgLink={"Menu-icon2.png"}
            mainTitle={"신고"}
            subTitle={
              <>
                사라진 친구를 <br /> 찾아주세요.
              </>
            }
            onclick={() => {
              nav("/missingDeclaration");
            }}
          />
          <MainMenu
            imgLink={"Menu-icon3.png"}
            mainTitle={"보호소"}
            subTitle={
              <>
                근처 보호소 <br /> 확인하기
              </>
            }
            onclick={() => {
              nav("/shelterList");
            }}
          />
          <MainMenu
            imgLink={"Menu-icon4.png"}
            mainTitle={"실종동물 보기"}
            subTitle={
              <>
                실종한 친구 <br /> 찾아보기
              </>
            }
            onclick={() => {
              nav("/missingList");
            }}
          />
        </div>
        <div className="map">
          <Map />
        </div>
      </div>
    </div>
  );
};
export default Home;
