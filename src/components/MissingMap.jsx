import { useEffect, useRef, useState } from "react";
import { useModal } from "../hooks/ModalContext";
import { useMissingState } from "../contexts/MissingContext";
import PetModalDetail from "../components/PetModalDetail";
import { useNavigate } from "react-router-dom";

const MissingMap = () => {
  const missingMapRef = useRef(null);
  const missingList = useMissingState();
  const missingMarkerMap = useRef(new Map()); // 마커 추적용 map 객체 생성(실종 신고 id 기준)
  const nav = useNavigate();

  const { isActive, toggleModal } = useModal();
  const [selectMissingPet, setSelectMissingPet] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=e26cd2b9a98785f9299bd0fe37542aab&libraries=services&autoload=false`;
    script.async = true;

    // script 로딩 완료 후 실행
    script.onload = () => {
      window.kakao.maps.load(() => {
        const missingMapContainer = document.getElementById("missingMap");
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const map = new window.kakao.maps.Map(missingMapContainer, options);
        missingMapRef.current = map;

        // missingMarkerMap 마커 id가 missingList에 존재하는지 여부 확인
        for (let [missingId, missingMarker] of missingMarkerMap.current) {
          // id가 missingList에 없으면 false
          let exist = false;
          // missingList에 id 존재 여부 확인
          for (let i = 0; i < missingList.length; i++) {
            if (missingList[i].petMissingId === missingId) {
              exist = true;
              break;
            }
          }
          // missingList에는 값이 없는데 마커는 있다면
          if (!exist) {
            // 삭제
            missingMarker.setMap(null);
            // map에서 제거
            missingMarkerMap.current.delete(missingId);
          }
        }

        // 반복문 돌면서 현재 missingList 기준으로 마커 추가
        for (let i = 0; i < missingList.length; i++) {
          // missingList item 하나 받아서 저장
          const pet = missingList[i];
          // missingList 내 petMissingId 저장
          const id = pet.petMissingId;

          // 신고자가 입력한 missingPoint 없으면 continue
          if (!pet.petMissingPoint) {
            continue;
          }

          const petLat = pet.petMissingPoint.lat;
          const petLng = pet.petMissingPoint.lng;

          // missingPoint 위도나 경도 null일 경우 continue
          if (petLat === null || petLng === null) {
            continue;
          }

          // missingPoint 위도 경도 저장
          const position = new window.kakao.maps.LatLng(petLat, petLng);

          // 마커에 실종 동물 이미지 넣기 (이상해서 일단 제외. 나중에 방법 다시 찾기;;)
          // const missingPetImage = pet.petImage || "/image-default.png";
          // const markerImage = new window.kakao.maps.MarkerImage(
          //   missingPetImage,
          //   new window.kakao.maps.Size(40, 40),
          //   { offset: new window.kakao.maps.Point(20, 20) }
          // );

          // map에 마커 찍기
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
            // image: markerImage,
          });

          // id 기준 마커 저장 (삭제시 필요)
          missingMarkerMap.current.set(id, marker);

          // map 내에 click 이벤트 (선택된 pet 정보 -> 모달열림)
          window.kakao.maps.event.addListener(marker, "click", () => {
            setSelectMissingPet(pet);
            toggleModal();
          });
        }
      });
    };
    document.head.appendChild(script);
  }, [missingList]);
  return (
    <>
      <div id="missingMap" style={{ width: "100%", height: "350px" }}></div>
      {isActive && selectMissingPet && (
        <PetModalDetail
          selectedId={selectMissingPet.petMissingId}
          onClick={() => {
            nav(`/missingReport/${selectMissingPet.petMissingId}`);
          }}
        />
      )}
    </>
  );
};
export default MissingMap;
