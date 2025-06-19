import "../style/MainMenu.css"

const MainMenu = ({ mainTitle, subTitle }) => {
  return (
    <div className="MainMenu" >
      <h2>{mainTitle}</h2>
      <p>{subTitle}</p>
    </div>
  );
};
export default MainMenu;
