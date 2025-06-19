import "../style/Button.css";

const Button = ({ text, type, onClick }) => {
  return (
    <button className={`Button Button_${type}`}>
      {text}
    </button>
  );
};

export default Button;
