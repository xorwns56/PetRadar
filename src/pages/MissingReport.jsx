import { useState } from 'react';

const MissingReport = () => {
  const [form, setForm] = useState({});
  return (
    <div>
      <Header leftChild={true} />
      <h2>실종 동물 제보</h2>
      <div>
        <h3>반려동물 이름</h3>
        <input placeholder="Value" />
      </div>
      <div>
        <h3>품종</h3>
        <select>
          <option>강아지</option>
        </select>
      </div>
    </div>
  );
};
export default MissingReport;
