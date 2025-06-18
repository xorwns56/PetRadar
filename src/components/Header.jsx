import "../style/Header.css";

const Header = ({ leftChild, rightChild }) => {
  return (
    <header className="Header">
      <div className="header_left">
        {leftChild ?? <img src="/Prev-btn.png" alt="logo" />}
      </div>
      <div className="header_center">
        <img src="/PetRadar-Logo.png" alt="logo" />
      </div>
      <div className="header_right">
        <p>{rightChild}</p>
        <p className="Msg-bell">
          <img src="/Msg-Bell.png" alt="msg" />
        </p>
      </div>
    </header>
  );
};
export default Header;
