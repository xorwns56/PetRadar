import { useEffect, useState } from "react";
import useShelterData from "../api/ShelterData";
import ShelterAnimalItem from "../components/ShelterAnimalItem";
import ShelterModalDetail from "../components/ShelterModalDetail";
import { useParams } from "react-router-dom";
import Header from "../components/Header";

const ShelterAnimalList = () => {
  const { animals } = useShelterData();
  const { name, addr } = useParams();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const decodedName = decodeURIComponent(name);
  const decodedAddr = decodeURIComponent(addr);

  const getFilteredData = () => {
    return animals.filter((a) => {
      const sName = a.SHTER_NM?.trim();
      const sAddr = a.REFINE_ROADNM_ADDR?.trim() || a.REFINE_LOTNO_ADDR?.trim();
      return sName === decodedName && sAddr === decodedAddr;
    });
  };

  return (
    <div className="ShelterAnimalList">
      <Header leftChild={true} />
      <div className="ShelterAnimalList-container inner">
        <h3>해당 보호소 유기동물</h3>
        <div className="MissingItems">
          {getFilteredData().map((item) => (
            <ShelterAnimalItem
              key={item.ABDM_IDNTFY_NO}
              petId={item.ABDM_IDNTFY_NO}
              petType={item.SPECIES_NM}
              petGender={item.SEX_NM}
              petName={item.SHTER_NM}
              petAge={item.AGE_INFO}
              petMissingDate={item.RECEPT_DE}
              onClick={() => {
                setSelectedAnimal(item);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>
      {isModalOpen && (
        <ShelterModalDetail
          animal={selectedAnimal}
          onClick={() => {}}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ShelterAnimalList;
