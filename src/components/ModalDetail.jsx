import { useModal } from '../hooks/ModalContext';
import '../style/ModalDetail.css';
import { getMissingImage } from '../utils/get-missingPet-image';
import { missingPet } from '../utils/missingPet';
import Button from './Button';

const ModalDetail = ({ petId, petName, petType, petGender, petAge, petMissingDate, onClick }) => {
  const { isActive, toggleModal } = useModal();

  return (
    <div className={`ModalDetail ${isActive ? 'active' : ''}`}>
      <div className="Modal-container">
        <div className="Modal-contents">
          <div className="img-box">
            <img src={getMissingImage(petId)} alt="missingPet img" />
          </div>
          <div className="text-contents">
            <div className="contents-t1">
              <h3 className="petType">{petType}고양이</h3>
              <h3>{petGender}♂</h3>
              <h3>{petName}코슈</h3>
            </div>
            <div className="contents-t2">
              <h3>나이</h3>
              <p>{petAge} 2022(년생)</p>
            </div>
            <div className="contents-t3">
              <h3>실종날짜 </h3>
              <p>{petMissingDate} 2025.06.01</p>
            </div>
            <div className="contents-t4">
              <h3>특징 </h3>
              <p>하얀색에 빨간색 옷을 입고있어요 당곡역 근처에서 산책하다가 잃어버렸어요ㅠ</p>
            </div>
          </div>
          <div className="Report-btn">
            <Button text={'제보하기'} type={'Square_D'} onClick={onClick} />
          </div>
        </div>
        <div className="Modal-btn" onClick={toggleModal}>
          <Button text={'X'} type={'Circle'} />
        </div>
      </div>
    </div>
  );
};
export default ModalDetail;
