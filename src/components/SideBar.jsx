import "../style/SideBar.css";
import Button from "./Button";
import AlertBox from "./AlertBox";
import { useSidebar } from "../hooks/SidebarContext";

const SideBar = () => {
  const { isActive, toggleSidebar } = useSidebar();

  return (
    <div className={`SideBar ${isActive ? "active" : ""}`}>
      <div className="close-btn" onClick={toggleSidebar}>
        <Button text={"X"} type={"Circle"} />
      </div>
      <AlertBox />
      <AlertBox />
    </div>
  );
};
export default SideBar;
