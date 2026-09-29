import { useCallback, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import StateNotice from "../components/layout/StateNotice";
import ShelterMap from "../components/shelter/ShelterMap";
import ShelterInfo from "../components/shelter/ShelterInfo";
import MapLocationNotice from "../components/missing/MapLocationNotice";
import { fetchShelters } from "../api/shelter";
import { useShelterQuery } from "../hooks/useShelterData";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../contexts/ModalContext";

/**
 * 보호소 찾기.
 *
 * 여기는 "내가 찾아가야 할 곳이 어디냐"를 보는 화면이라 건물 위치가 곧
 * 필요한 정보다. 그래서 이 화면에서만 보호소 좌표를 지도에 찍는다.
 * (홈에서는 찍지 않는다 — 거기 지도의 마커는 "실종된 지점"이라
 *  보관 장소인 보호소를 섞으면 발견 위치로 오해한다)
 *
 * 목록은 지도에 보이는 범위만 보여준다. 전국 263곳을 한 줄로 세우면
 * 서울 사용자가 제주 보호소까지 스크롤하게 되는데(실제로 64%가 100km 밖),
 * 반경을 몇 km로 할지 정하는 대신 지도를 끌고 확대하는 행동에 맡긴다.
 */
const ShelterList = () => {
  const navigate = useNavigate();
  const { isActive, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState(null);

  /* 위치를 기다리지 않고 먼저 받는다. 위치 응답을 기다리게 했더니 사용자가
     권한 팝업에 답하지 않거나 거부하면 목록이 영영 안 떴다 */
  const { position, status, request } = useGeolocation();

  const {
    data: shelters,
    error,
    loading,
  } = useShelterQuery(
    () => fetchShelters(position ? { lat: position.lat, lng: position.lng } : {}),
    [position?.lat, position?.lng]
  );

  // 지도가 "지금 보이는 범위"를 알려준다. null은 아직 안 알려준 상태
  const [visible, setVisible] = useState(null);
  const onVisibleChange = useCallback((list) => setVisible(list), []);

  // 지도와 목록이 서로를 가리킨다. 마커가 겹쳐도 목록에서 골라낼 수 있게
  const [highlighted, setHighlighted] = useState(null);
  const onHover = useCallback((id) => setHighlighted(id), []);

  /* 가까운 순으로 세운다. 거리를 모르면(위치 거부) 보호 중인 마릿수 순 —
     이때 이름순은 아무 의미가 없고, 아이가 많은 곳이 먼저 볼 곳이다 */
  const listed = useMemo(() => {
    const items = visible ?? [];
    return [...items].sort((a, b) =>
      a.distanceKm != null && b.distanceKm != null
        ? a.distanceKm - b.distanceKm
        : b.animalCount - a.animalCount
    );
  }, [visible]);

  const open = (shelter) => {
    setSelected(shelter);
    openModal();
  };

  const goToAnimals = (shelter) =>
    navigate(`/shelter/${encodeURIComponent(shelter.careRegNo)}`);

  if (error) {
    return (
      <Layout width="wide">
        <PageHeading title="보호소 찾기" />
        <StateNotice
          message="보호소 정보를 불러오지 못했습니다."
          actionText="다시 시도"
          onAction={() => window.location.reload()}
        />
      </Layout>
    );
  }

  return (
    <Layout width="wide">
      <PageHeading
        title="보호소 찾기"
        description="지도를 옮기거나 확대하면 그 지역의 보호소가 옆에 나와요."
      />

      {/* 지도와 목록이 같은 높이를 나눠 갖는다.
          안쪽 스크롤이 살아 있으려면 높이 사슬이 끊기면 안 되므로,
          감싸는 칸마다 flex와 min-h-0을 함께 준다 */}
      <div className="flex h-[78dvh] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:h-[72dvh] lg:flex-row">
        {/* 좁은 화면에서는 지도를 줄여 목록 칸을 확보한다.
            지도 300px이면 목록에 항목이 한 개 반밖에 안 들어왔다 */}
        <div className="relative h-[240px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          {loading ? (
            <p className="flex h-full animate-pulse items-center justify-center text-sm text-ink-muted">
              지도를 준비하고 있어요
            </p>
          ) : (
            <>
              <ShelterMap
                shelters={shelters}
                center={position}
                selectedId={selected?.careRegNo}
                highlightedId={highlighted}
                onSelect={open}
                onHover={onHover}
                onVisibleChange={onVisibleChange}
              />
              {/* 위치를 못 받으면 전국이 보이는데, 그 이유를 말해주지 않으면
                  사용자는 그냥 고장난 줄 안다. 상태마다 할 수 있는 일이 달라
                  신고 폼 지도가 쓰던 안내를 그대로 쓴다 */}
              <MapLocationNotice status={status} onRetry={request} />
            </>
          )}
        </div>

        <aside className="flex min-h-0 flex-1 flex-col border-line lg:w-[340px] lg:flex-none lg:border-l">
          <header className="shrink-0 border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-ink">
              {visible === null ? "보호소를 찾는 중" : `이 지역 ${listed.length}곳`}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {position
                ? "가까운 순이에요."
                : "위치를 허용하면 가까운 순으로 보여드려요."}
            </p>
          </header>

          <div className="scroll-visible min-h-0 flex-1 overflow-y-auto">
            {visible !== null && listed.length === 0 && (
              <p className="px-4 py-8 text-center text-sm leading-relaxed break-keep text-ink-muted">
                이 지역에는 보호 중인 보호소가 없어요.
                <br />
                지도를 줄이거나 옮겨보세요.
              </p>
            )}

            <ul>
              {listed.map((shelter) => (
                <li key={shelter.careRegNo} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => open(shelter)}
                    onMouseEnter={() => setHighlighted(shelter.careRegNo)}
                    onMouseLeave={() => setHighlighted(null)}
                    /* 키보드로 훑을 때도 지도가 따라오게 한다 */
                    onFocus={() => setHighlighted(shelter.careRegNo)}
                    onBlur={() => setHighlighted(null)}
                    className={cn(
                      "block w-full cursor-pointer px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
                      (highlighted ?? selected?.careRegNo) === shelter.careRegNo
                        ? "bg-brand-soft"
                        : "hover:bg-brand-soft"
                    )}
                  >
                    <span className="block truncate font-bold text-ink">
                      {shelter.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                      {shelter.address}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-md bg-brand px-1.5 py-0.5 font-semibold text-white">
                        {shelter.animalCount}마리
                      </span>
                      {/* 좌표가 없는 센터가 소수 있어 거리가 비기도 한다 */}
                      {shelter.distanceKm != null && (
                        <span className="text-ink-muted">
                          {shelter.distanceKm}km
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {isActive && selected && (
        <ShelterInfo
          shelter={selected}
          onClose={() => {
            closeModal();
            setSelected(null);
          }}
          onViewAnimals={goToAnimals}
        />
      )}
    </Layout>
  );
};

export default ShelterList;
