import "./Modal.css";

const Modal = ({ onClose, children }) => {
  return (
    <div className="popup-wrapper" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};
export default Modal;
