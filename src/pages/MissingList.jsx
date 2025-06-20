import '../style/MissingList.css';
import { useState } from 'react';
import { missingPet } from '../utils/missingPet';
import Button from '../components/Button';
import Header from '../components/Header';
import MissingItem from '../components/MissingItem';
import { useNavigate } from 'react-router-dom';

const MissingList = () => {
  const nav = useNavigate();

  const [selectedMissingPet, setSelectedMissingPet] = useState(null);
  const [sortType, setSortType] = useState('latest');
  const onChangeSortType = (e) => {
    setSortType(e.target.value);
  };

  const getSortedData = () => {
    return [...missingPet].toSorted((prev, next) => {
      const prevDate = new Date(prev.petMissingDate);
      const nextDate = new Date(next.petMissingDate);
      if (sortType === 'oldest') {
        return prevDate - nextDate;
      } else {
        return nextDate - prevDate;
      }
    });
  };
  const sortedData = getSortedData();

  const [search, setSearch] = useState('');
  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };
  const getFilterTitle = () => {
    if (search === '') {
      return sortedData;
    }
    return sortedData.filter((title) => title.petTitle.toLowerCase().includes(search.toLowerCase()));
  };
  const getFilterTitleData = getFilterTitle();

  return (
    <div className="MissingList">
      <Header leftChild={true} />
      <div className="MissingList-conatiner inner">
        <div className="menu-title">
          <h3>실종동물 목록</h3>
        </div>
        <div className="search-box">
          <select value={sortType} onChange={onChangeSortType}>
            <option value={'latest'}>최신순</option>
            <option value={'oldest'}>오래된 순</option>
          </select>
          <input value={search} onChange={onChangeSearch} placeholder="검색할 제목을 입력하세요." />
          <Button text={'조회'} type={'Square'} />
        </div>

        <div className="MissingItems">
          {getFilterTitleData.map((item) => (
            <MissingItem
              key={item.id}
              {...item}
              onClick={() => {
                nav('/missingReport');
              }}
            />
          ))}
        </div>

        <div className="MissingList-btn">
          <Button
            text={'실종 동물 신고'}
            type={'Square_lg'}
            onClick={() => {
              nav('/missingDeclaration');
            }}
          />
        </div>
      </div>

      {/* selectedMissingPet 아직 미작업 */}
      {selectedMissingPet && <Modal onClose={() => setSelectedMissingPet(null)}>{selectedMissingPet}</Modal>}
    </div>
  );
};
export default MissingList;
