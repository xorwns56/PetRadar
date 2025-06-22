import "../style/MyPostReportItem.css";
const MyPostReportItem = ({ title, content, petImage, onClick }) => {
  const imageSrc = petImage || "/defaultPet.png";
  return (
    <div onClick={onClick} className="MyPostReportItem">
      <div className="thumbnail">
        <img src={imageSrc} />
      </div>
      <div className="info">
        <p className="title">{title}</p>
        <p className="description">{content}</p>
        <p className="location">위치보기 →</p>
      </div>
    </div>
  );
};
export default MyPostReportItem;
