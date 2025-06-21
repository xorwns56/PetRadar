import { useEffect, useRef, useState } from "react";
import { useModal } from '../hooks/ModalContext';
import { useMissingState } from "../contexts/MissingContext"; 
import ModalDetail from "../components/ModalDetail"

const MissingMap = () => {
    const missingMapRef = useRef(null);
    const missingList = useMissingState();

    const { isActive, toggleModal } = useModal();
    const [selectMissingPet, setSelectMissingPet] = useState(null);

    useEffect(() =>{
        if (!window.kakao || !window.kakao.maps) return;
        
        const missingMapContainer = document.getElementById("missingMap");
        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level : 3,
        }

        const map = new window.kakao.maps.Map(missingMapContainer, options);
        missingMapRef.current = map;

        missingList.forEach((pet) => {
            if(!pet.petMissingPoint) {
                return;
            }
            const position = new window.kakao.maps.LatLng(
                pet.petMissingPoint.lat,
                pet.petMissingPoint.lng,
            );

            const marker = new window.kakao.maps.Marker({
                position : position,
                map : map,
            })

            window.kakao.maps.event.addListener(marker, "click", () => {
                setSelectMissingPet(pet);
                toggleModal();
            })
        });
    },[missingList])
  return <><div id="missingMap" style={{ width: "100%", height: "350px" }}></div>
  {isActive && selectMissingPet && (
    <ModalDetail 
    // petId={selectMissingPet.petid} 
    // petName={selectMissingPet.petName}
    // petType={selectMissingPet.petType}
    // petGender={selectMissingPet.petGender}
    // petAge={selectMissingPet.petAge}
    // petMissingDate={selectMissingPet.petMissingDate}
    />
  )}
  </>
};
export default MissingMap;
