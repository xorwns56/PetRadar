import '../style/SideBar.css';
import Button from './Button';
import AlertBox from './AlertBox';

const SideBar = () => {
  return (
    <div className="SideBar">
      <div className="close-btn">
        <Button text={'X'} type={'Circle'} />
      </div>
      <AlertBox />
    </div>
  );
};
export default SideBar;
