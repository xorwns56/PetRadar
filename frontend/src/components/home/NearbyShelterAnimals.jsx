import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShelterAnimalItem from "../shelter/ShelterAnimalItem";
import ShelterAnimalModalDetail from "../shelter/ShelterAnimalModalDetail";
import StateNotice from "../layout/StateNotice";
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
 *
 * 동네가 정해질 때까지 아무것도 부르지 않는다. 예전에는 위치를 모르는 채
 * 전국 목록을 먼저 받아 띄웠는데, 동네가 정해지는 순간 네 마리가 통째로
 * 교체되어 사진을 두 번 받았다 — 먼저 받은 네 장은 화면에 남지도 않고
 * 버려지면서, 정작 보여줄 사진의 다운로드만 그만큼 늦게 시작됐다.
 * 전국 목록은 "우리 동네"가 아니라 이 섹션의 뜻도 잃는다.
 */
const NearbyShelterAnimals = () => {
  const nav = useNavigate();
  const { isActive, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState(null);

  const { position, status, request } = useGeolocation();

  // 좌표 → "경기도 화성시"
  const [region, setRegion] = useState(null);
  const [regionFailed, setRegionFailed] = useState(false);
  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    setRegionFailed(false);
    toRegionName(position.lat, position.lng)
      .then((name) => {
        if (cancelled) return;
        // 좌표는 받았는데 동네 이름을 얻지 못했다. 기다려도 바뀌지 않으므로
        // 로딩에 갇히지 않게 실패로 다룬다
        if (name) setRegion(name);
        else setRegionFailed(true);
      })
      .catch(() => {
        if (!cancelled) setRegionFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  // 세 번째 인자가 false인 동안에는 부르지 않는다
  const {
    data: animals,
    error,
    loading,
  } = useShelterQuery(
    () => fetchAnimalsByRegion({ region, limit: 4 }),
    [region],
    Boolean(region),
  );

  // 불러오지 못했으면 홈에 깨진 자리를 남기지 않고 통째로 숨긴다
  if (error) return null;

  // 위치를 못 받으면 보여줄 것이 없다. 차단은 영구 상태이고,
  // 측위·동네 확인 실패는 다시 시도할 만하다
  const blocked = status === "blocked";
  const retryable = status === "unavailable" || regionFailed;

  // 동네가 정해질 때까지 자리가 비어 있으므로, 무엇을 기다리는 중인지 밝힌다.
  // 문구는 지도 쪽 MapLocationNotice와 같게 맞춘다
  let subtitle = "우리 동네 보호소에 들어온 아이들을 보여드려요.";
  if (region) subtitle = `${region}에서 발견되어 보호 중인 아이들이에요.`;
  else if (!blocked && !retryable)
    subtitle =
      status === "prompt"
        ? "위치를 허용하면 우리 동네 보호소를 보여드려요."
        : "내 위치를 찾는 중이에요.";

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            보호소에 들어온 아이들
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => nav("/shelterList")}
          className="cursor-pointer text-sm font-semibold text-brand-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          더보기 →
        </button>
      </div>

      {blocked ? (
        // 한 번 차단하면 사이트가 팝업을 다시 띄울 수 없다. 눌러도 아무 일이
        // 없을 버튼 대신 무엇을 하면 되는지만 알린다. 주소창에서 허용하면
        // useGeolocation이 권한 변경을 받아 바로 반영한다
        <StateNotice message="위치 권한을 허용하면 우리 동네 보호소에 들어온 아이들을 보여드려요." />
      ) : retryable ? (
        <StateNotice
          message="위치를 가져오지 못해 우리 동네 보호소를 보여드릴 수 없어요."
          actionText="다시 시도"
          onAction={request}
        />
      ) : loading ? (
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
