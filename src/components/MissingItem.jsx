import '../style/MissingItem.css';
import { getMissingImage } from '../utils/get-missingPet-image';
import Button from './Button';

const MissingItem = ({
  petId,
  petName,
  petType,
  petGender,
  petAge,
  petMissingDate,
  petImage,
  onClick,
  toggleModal,
}) => {
  return (
    <div className="MissingItem">
      <div className="MissingItem-img" onClick={toggleModal}>
        <img src={petImage ? petImage : getMissingImage(petId)} alt="missingPet img" />
      </div>
      <div className="contents" onClick={toggleModal}>
        <div className="contents-t1">
          <p className="petType">{petType}</p>
          <p>{petGender}</p>
          <p>{petName}</p>
        </div>
        <p className="contents-t2">{petAge}(년생)</p>
        <p className="contents-t3">실종일자 : {petMissingDate}</p>
      </div>
      <div className='ReportMove-btn'>
        <Button text={'제보하기'} type={'Square_ls'} onClick={onClick} />
      </div>
    </div>
  );
};
export default MissingItem;
