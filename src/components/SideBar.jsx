import "../style/SideBar.css";
import Button from "./Button";
import ReportAlertBox from "./ReportAlertBox";
import MissingAlertBox from "./MissingAlertBox";
import { useSidebar } from "../hooks/SidebarContext";
import { useMissingState } from "../contexts/MissingContext";
import { useReportState } from "../contexts/ReportContext";
import { useUserDispatch, useUserState } from "../contexts/UserContext";
import { useEffect } from "react";

const SideBar = () => {
  const { isActive, toggleSidebar } = useSidebar();
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const missingState = useMissingState();
  const reportState = useReportState();
  useEffect(() => {
    const info = userState.users.find(
      (user) => user.id === userState.currentUser
    );

    //일단 user로부터 lastAlertDate을 받아오고 그거보다 createDate가 큰 게시물(실종신고, 내 게시글에 대한 제보)을 가져와야한다
    //끝날 때 lastAlertDate를 Date.now()로 갱신시켜야한다.
  }, [userState.currentUser, missingState, reportState]);
  return (
    <div className={`SideBar ${isActive ? "active" : ""}`}>
      <div className="close-btn" onClick={toggleSidebar}>
        <Button text={"X"} type={"Circle"} />
      </div>
      <ReportAlertBox />
      <MissingAlertBox />
    </div>
  );
};
export default SideBar;
