import '../style/MissingReport.css';
import Header from '../components/Header';
import Button from '../components/Button';
import Map from '../components/Map';

const MissingReport = () => {
  const onSubmitButtonClick = () => {};

  return (
    <div className="MissingReport">
      <Header leftChild={true} />
      <div className="MissingReport-container inner">
        <div className="menu-title">
          <h3>실종 동물 제보하기</h3>
        </div>
        <div className="MissingReportForms">
          <div className="MissingReportForm">
            <h3>제목</h3>
            <input type="text" />
            {/* <input name="petTitle" value={form.petTitle} onChange={handleChange} /> */}
          </div>
          <div className="MissingReportForm">
            <h3>내용</h3>
            <textarea type="text" placeholder="상세한 설명을 적어주세요." />
            {/* <textarea
            name="petContent"
            value={form.petContent}
            onChange={handleChange}
            placeholder="상세한 설명을 적어주세요."
          /> */}
          </div>
          {/* 발견 장소 위치 Map 사용 : css 수정 필요 */}
          <div className="MissingReportForm">
            <h3>발견 장소</h3>
            <Map />
          </div>
          <div className="MissingReport-btn">
            <Button onClick={onSubmitButtonClick} text={'신고하기'} type={'Square_lg'}></Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MissingReport;
