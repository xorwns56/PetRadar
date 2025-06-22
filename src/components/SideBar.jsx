import '../style/SideBar.css';
import Button from './Button';
import ReportAlertBox from './ReportAlertBox';
import MissingAlertBox from './MissingAlertBox';
import { useSidebar } from '../hooks/SidebarContext';

const SideBar = () => {
  const { isActive, toggleSidebar } = useSidebar();

  return (
    <div className={`SideBar ${isActive ? 'active' : ''}`}>
      <div className="close-btn" onClick={toggleSidebar}>
        <Button text={'X'} type={'Circle'} />
      </div>
      <ReportAlertBox />
      <MissingAlertBox />
    </div>
  );
};
export default SideBar;
