import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShelterAnimalItem from "../shelter/ShelterAnimalItem";
import ShelterAnimalModalDetail from "../shelter/ShelterAnimalModalDetail";
import { fetchAnimalsByRegion } from "../../api/shelter";
import { useShelterQuery } from "../../hooks/useShelterData";
import { useGeolocation } from "../../hooks/useGeolocation";
import { toRegionName } from "../../lib/kakaoMap";
import { useModal } from "../../contexts/ModalContext";

/**
 * 홈의 "우리 동네 보호소에 들어온 아이들".
 *
 * 지도가 아니라 카드로 보여준다. 실종된 아이를 찾는 사람이 하는 일은
 * 위치 확인이 아니라 사진 훑기이고, 보호동물의 좌표는 "발견된 곳"이 아니라
 * "지금 보관 중인 건물"이라 지도에 섞으면 발견 위치로 오해한다.
 *
 * 지역은 거리가 아니라 관할 지자체로 정한다 — 공공 API가 발견 지점의
 * 좌표를 주지 않기 때문이다. 유기동물은 발견된 지자체로 접수되므로
 * 관할이 사실상 발견 지역이다.
 */
const NearbyShelterAnimals = () => {
  const nav = useNavigate();
  const { isActive, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState(null);

  // 위치를 기다리지 않는다. 못 받으면 서버가 전국 최신순으로 돌려준다
  const { position } = useGeolocation();

  // 좌표 → "경기도 화성시"
  const [region, setRegion] = useState(null);
  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    toRegionName(position.lat, position.lng)
      .then((name) => {
        if (!cancelled) setRegion(name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [position]);

  // 위치를 못 받으면 region 없이 부른다. 서버가 전국 최신순으로 돌려준다
  const {
    data: animals,
    error,
    loading,
  } = useShelterQuery(() => fetchAnimalsByRegion({ region, limit: 4 }), [region]);

  // 불러오지 못했으면 홈에 깨진 자리를 남기지 않고 통째로 숨긴다
  if (error) return null;

  const busy = loading;

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            보호소에 들어온 아이들
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {region
              ? `${region}에서 발견되어 보호 중인 아이들이에요.`
              : "전국 보호소에서 지금 보호 중인 아이들이에요."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => nav("/shelterList")}
          className="cursor-pointer text-sm font-semibold text-brand-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          더보기 →
        </button>
      </div>

      {busy ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-line bg-surface"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {animals.map((animal) => (
            <ShelterAnimalItem
              key={animal.desertionNo}
              animal={animal}
              onClick={() => {
                setSelected(animal);
                openModal();
              }}
            />
          ))}
        </div>
      )}

      {isActive && selected && (
        <ShelterAnimalModalDetail
          animal={selected}
          onClose={() => {
            closeModal();
            setSelected(null);
          }}
        />
      )}
    </section>
  );
};

export default NearbyShelterAnimals;
