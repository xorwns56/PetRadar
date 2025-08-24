import "../style/SideBar.css";
import Button from "./Button";
import ReportAlertBox from "./ReportAlertBox";
import MissingAlertBox from "./MissingAlertBox";
import { useSidebar } from "../hooks/SidebarContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const nav = useNavigate();
  const { isActive, toggleSidebar } = useSidebar();

  /*
  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const missingState = useMissingState();
  const reportState = useReportState();
  const userInfo = userState.users.find(
    (user) => user.id === userState.currentUser
  );
  */
  const onAlertClose = (alert) => {
      /*
    userDispatch({
      type: "REMOVE_ALERT",
      data: {
        id: userInfo.id,
        postId: alert.postId,
        postType: alert.postType,
      },
    });
*/
  };

  useEffect(() => {
      /*
    let newAlert = [];
    if (userInfo) {
      const lastAlertDate = userInfo.lastAlertDate ?? userInfo.createDate ?? 0;
      const missingAlert = missingState
        .filter(
          (item) => lastAlertDate < item.createDate && item.id !== userInfo.id
        )
        .map((item) => ({
          id: item.id,
          postId: item.petMissingId,
          postType: "missing",
          createDate: item.createDate,
        }));
      const reportAlert = reportState
        .filter(
          (item) =>
            lastAlertDate < item.createDate &&
            item.petMissingUser === userInfo.id
        )
        .map((item) => ({
          id: item.id,
          postId: item.petReportId,
          postType: "report",
          createDate: item.createDate,
        }));
      newAlert = [...missingAlert, ...reportAlert].toSorted(
        (prev, next) => next.createDate - prev.createDate
      );
      userDispatch({
        type: "ADD_ALERT",
        data: {
          id: userInfo.id,
          alerts: newAlert,
        },
      });
    }
    */
  }, []); //userState.currentUser, missingState, reportState
  return (
    <div className={`SideBar ${isActive ? "active" : ""}`}>
      <div className="close-btn" onClick={toggleSidebar}>
        <Button text={"X"} type={"Circle"} />
      </div>
{/*       {userInfo && */}
{/*         (userInfo.alerts || []).map((alert) => */}
{/*           alert.postType === "missing" ? ( */}
{/*             <MissingAlertBox */}
{/*               key={`${alert.postType}_${alert.postId}`} */}
{/*               {...alert} */}
{/*               onAlertClick={() => nav("/missingList")} */}
{/*               onAlertClose={() => onAlertClose(alert)} */}
{/*             /> */}
{/*           ) : ( */}
{/*             <ReportAlertBox */}
{/*               key={`${alert.postType}_${alert.postId}`} */}
{/*               {...alert} */}
{/*               currentUser={userState.currentUser} */}
{/*               onAlertClick={() => nav("/myPage")} */}
{/*               onAlertClose={() => onAlertClose(alert)} */}
{/*             /> */}
{/*           ) */}
{/*         )} */}
    </div>
  );
};
export default SideBar;
