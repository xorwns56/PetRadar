import "../style/SideBar.css";
import Button from "./Button";
import AlertBox from "./AlertBox";

const SideBar = ({isActive, toggleSidebar}) => {
 

  return (
    <div className={`SideBar ${isActive ? "active" : ""}`} > 
      <div className="close-btn" onClick={toggleSidebar}>
        <Button text={"X"} type={"Circle"} />
      </div>
      <AlertBox />
      <AlertBox />
    </div>
  );
};
export default SideBar;
