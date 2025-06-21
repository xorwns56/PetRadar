import '../style/MypageModalDetail.css';
import { useModal } from '../hooks/ModalContext';

import { getMissingImage } from '../utils/get-missingPet-image'; // 수정필요
import { missingPet } from '../utils/missingPet'; // 수정필요

import Button from './Button';

const MypageModalDetail = ({ petId, petName, petType, petGender, petAge, petMissingDate, onClick }) => {
  const { isActive, toggleModal } = useModal();

  return (
    <div className={`MypageModalDetail ${isActive ? 'active' : ''}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="Map-box">
            <p>map</p>
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <p className="petType">고양이를 발견했어요!!</p>
            </div>
            <div className="contents-t2">
              <p>당곡역 근처에서 햐얀색 고양이가 서성이던데 이 고양이가 맞나요? 비슷해보여서 글 남깁니다!</p>
            </div>
          </div>
        </div>
        <div className="Modal-btn" onClick={toggleModal}>
          <Button text={'X'} type={'Circle'} />
        </div>
      </div>
    </div>
  );
};
export default MypageModalDetail;
