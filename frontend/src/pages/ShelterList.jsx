import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import StateNotice from "../components/layout/StateNotice";
import Button from "../components/ui/Button";
import ShelterMap from "../components/shelter/ShelterMap";
import ShelterInfo from "../components/shelter/ShelterInfo";
import { fetchShelters } from "../api/shelter";
import { useShelterQuery } from "../hooks/useShelterData";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../contexts/ModalContext";

/**
 * 보호소 목록.
 *
 * 여기는 "내가 찾아가야 할 곳이 어디냐"를 보는 화면이라 건물 위치가 곧
 * 필요한 정보다. 그래서 이 화면에서만 보호소 좌표를 지도에 찍는다.
 * (홈에서는 찍지 않는다 — 거기 지도의 마커는 "실종된 지점"이라
 *  보관 장소인 보호소를 섞으면 발견 위치로 오해한다)
 */
const ShelterList = () => {
  const navigate = useNavigate();
  const { isActive, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState(null);

  /* 위치를 기다리지 않고 먼저 받는다. 좌표가 오면 가까운 순으로 다시 받는다.
     위치 응답을 기다리게 했더니, 사용자가 권한 팝업에 답하지 않거나 거부하면
     목록이 영영 안 뜨고 스켈레톤에 갇혔다 */
  const { position } = useGeolocation();

  const {
    data: shelters,
    error,
    loading,
  } = useShelterQuery(
    () => fetchShelters(position ? { lat: position.lat, lng: position.lng } : {}),
    [position?.lat, position?.lng]
  );

  const open = (shelter) => {
    setSelected(shelter);
    openModal();
  };

  const close = () => {
    closeModal();
    setSelected(null);
  };

  const goToAnimals = (shelter) =>
    navigate(`/shelter/${encodeURIComponent(shelter.careRegNo)}`);

  const busy = loading;

  /* 지도에는 가까운 곳만 찍는다.
     전국 260곳을 한 번에 담으면 setBounds가 카카오 타일이 없는 배율까지
     넓혀 버려(레벨 13 초과) 지도가 흰 화면이 된다. 그리고 전국을 다 찍은
     지도는 "내가 찾아갈 곳"을 고르는 데 아무 도움이 안 된다 */
  const MAP_LIMIT = 20;
  const nearby = useMemo(
    () => (position ? shelters.slice(0, MAP_LIMIT) : []),
    [shelters, position]
  );

  return (
    <Layout width="wide">
      <PageHeading
        title="보호소 정보"
        description={
          position
            ? "가까운 순으로 보여드려요. 지도의 표시나 카드를 누르면 연락처를 볼 수 있어요."
            : "보호 중인 아이가 있는 보호소예요. 위치를 허용하면 가까운 순으로 보여드려요."
        }
      />

      {/* 불러오지 못했을 때는 상자를 아예 띄우지 않는다 —
          빈 네모만 남으면 고장난 것처럼 보인다 */}
      {!error && (
        <div className="h-[320px] overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:h-[400px]">
          {busy ? (
            <p className="flex h-full animate-pulse items-center justify-center text-sm text-ink-muted">
              지도를 준비하고 있어요
            </p>
          ) : nearby.length > 0 ? (
            <ShelterMap
              shelters={nearby}
              selectedId={selected?.careRegNo}
              onSelect={open}
            />
          ) : (
            /* 위치를 모르면 지도를 띄우지 않는다. 어디를 보여줄지 정할 수
               없어 전국을 펼치게 되는데, 그건 찾아갈 곳을 고르는 데 쓸모가 없다 */
            <p className="flex h-full items-center justify-center px-6 text-center text-sm text-ink-muted">
              위치를 허용하면 가까운 보호소를 지도에 보여드려요.
            </p>
          )}
        </div>
      )}

      <div className="mt-8">
        {busy && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-line bg-surface"
              />
            ))}
          </div>
        )}

        {!busy && error && (
          <StateNotice
            message="보호소 정보를 불러오지 못했습니다."
            actionText="다시 시도"
            onAction={() => window.location.reload()}
          />
        )}

        {!busy && !error && shelters.length === 0 && (
          <StateNotice message="표시할 보호소 정보가 없습니다." />
        )}

        {!busy && !error && shelters.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shelters.map((shelter) => (
              <article
                key={shelter.careRegNo}
                className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <button
                  type="button"
                  onClick={() => open(shelter)}
                  className="flex cursor-pointer items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <img
                    src="/image-default.png"
                    alt=""
                    className="size-16 shrink-0 rounded-xl bg-brand-soft object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">
                      {shelter.name}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed break-keep text-ink-muted">
                      {shelter.address}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-semibold text-brand-ink">
                        {shelter.animalCount}마리 보호 중
                      </span>
                      {/* 좌표가 없는 센터가 소수 있어 거리가 비기도 한다 */}
                      {shelter.distanceKm != null && (
                        <span className="text-ink-muted">
                          {shelter.distanceKm}km
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => goToAnimals(shelter)}
                >
                  보호동물 보기
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>

      {isActive && selected && (
        <ShelterInfo
          shelter={selected}
          onClose={close}
          onViewAnimals={goToAnimals}
        />
      )}
    </Layout>
  );
};

export default ShelterList;
