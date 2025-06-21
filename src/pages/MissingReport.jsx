import '../style/MissingReport.css';
import Header from '../components/Header';
import Button from '../components/Button';
import Map from '../components/Map';

import ReportMap from '../components/ReportMap';
import {useReportDispatch, useReportState} from "../contexts/ReportContext";

import { useState } from 'react';
import { data, useNavigate } from 'react-router-dom';

const MissingReport = () => {
  const dispatch = useReportDispatch();
  const nav = useNavigate();
  const [form, setForm] = useState({
    reportTitle: "",
    reportContetnt: "",
    lat: null,
    lng: null,
  });

  const onCreate = () =>{
    dispatch({
      type: "CREATE",
      data: {
        ...form,
      },
    })
  }

  const onSubmitButtonClick = () => {
    onCreate();
    nav("/missingList");
  };

  const handleChange = (e) =>{
    const {name, value} = e.target;
    setForm((prev) => ({...prev, [name] : value}))
  }
  const onLocationSelect = (latlng) =>{
    setForm((prev) => ({
      ...prev,
      lat: latlng.lat,
      lng: latlng.lng,
    }))
  }

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
            {/* <input type="text" /> */}
            <input name="reportTitle" value={form.reportTitle} onChange={handleChange} />
          </div>
          <div className="MissingReportForm">
            <h3>내용</h3>
            {/* <textarea type="text" placeholder="상세한 설명을 적어주세요." /> */}
            <textarea
            name="reportContetnt"
            value={form.reportContetnt}
            onChange={handleChange}
            placeholder="상세한 설명을 적어주세요."
          />
          </div>
          {/* 발견 장소 위치 Map 사용 : css 수정 필요 */}
          <div className="MissingReportForm">
            <h3>발견 장소</h3>
            <ReportMap onSelect={onLocationSelect}/>
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
