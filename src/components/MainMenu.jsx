const MainMenu = ({ mainTitle, subTitle }) => {
  return (
    <div style={{ width: "32%", height:"160px", border: "solid 1px #000",padding:"20px", borderRadius:"5px" }}>
      <h2 style={{fontSize:"22px"}}>{mainTitle}</h2>
      <p style={{fontSize:"16px", paddingTop:"15px"}}>{subTitle}</p>
    </div>
  );
};
export default MainMenu;
