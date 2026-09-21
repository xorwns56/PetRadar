import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import StateNotice from "../components/layout/StateNotice";
import Button from "../components/Button";
import Map from "../components/Map";
import ShelterInfo from "../components/ShelterInfo";
import ShelterModalDetail from "../components/ShelterModalDetail";
import useShelterData from "../api/ShelterData";
import { useModal } from "../hooks/ModalContext";

const ShelterList = () => {
  const { animals, error, loading } = useShelterData();
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { isActive, toggleModal } = useModal();

  // 지도의 표시를 눌렀을 때와 카드를 눌렀을 때 뜨는 모달이 다르다
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const uniqueShelters = animals
    .filter((shelter, index, self) => {
      const key = `${shelter.SHTER_NM}-${
        shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
      }`;
      return (
        index ===
        self.findIndex(
          (s) =>
            `${s.SHTER_NM}-${s.REFINE_ROADNM_ADDR || s.REFINE_LOTNO_ADDR}` ===
            key
        )
      );
    })
    .slice(0, 5); // 상위 5개만 유지

  const goToAnimals = (shelter) => {
    const name = encodeURIComponent(shelter.SHTER_NM);
    const addr = encodeURIComponent(
      shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR
    );
    navigate(`/shelter/${name}/${addr}`);
  };

  return (
    <Layout width="wide">
      <PageHeading
        title="보호소 정보"
        description="지도의 표시나 아래 카드를 누르면 연락처를 볼 수 있어요."
      />

      {/* 지도 높이는 여기서 정한다. 예전에는 감싸는 상자가 화면의 30%,
          지도는 350px 고정이라 화면이 낮으면 지도가 잘렸다.
          불러오지 못했을 때는 상자를 아예 띄우지 않는다 —
          빈 네모만 남으면 고장난 것처럼 보인다 */}
      {!error && (
        <div className="h-[320px] overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:h-[400px]">
          {loading ? (
            <p className="flex h-full animate-pulse items-center justify-center text-sm text-ink-muted">
              지도를 준비하고 있어요
            </p>
          ) : (
            <Map
              shelters={uniqueShelters}
              onSelect={(shelter) => {
                if (mapRef.current) mapRef.current(shelter);
                setSelectedShelter(shelter);
                setSelectedAnimal(null);
                toggleModal();
              }}
              setCenterRef={mapRef}
            />
          )}
        </div>
      )}

      <div className="mt-8">
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-line bg-surface"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <StateNotice
            message="보호소 정보를 불러오지 못했습니다."
            actionText="다시 시도"
            onAction={() => window.location.reload()}
          />
        )}

        {!loading && !error && uniqueShelters.length === 0 && (
          <StateNotice message="표시할 보호소 정보가 없습니다." />
        )}

        {!loading && !error && uniqueShelters.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uniqueShelters.map((shelter, index) => (
              <article
                key={index}
                className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnimal(shelter);
                    setSelectedShelter(null);
                    toggleModal();
                  }}
                  className="flex cursor-pointer items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <img
                    src="/image-default.png"
                    alt=""
                    className="size-16 shrink-0 rounded-xl bg-brand-soft object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">
                      {shelter.SHTER_NM}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed break-keep text-ink-muted">
                      {shelter.REFINE_ROADNM_ADDR || shelter.REFINE_LOTNO_ADDR}
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

      {isActive && selectedShelter && (
        <ShelterInfo
          shelter={selectedShelter}
          onClose={() => {
            toggleModal();
            setSelectedShelter(null);
          }}
        />
      )}

      {isActive && selectedAnimal && (
        <ShelterModalDetail
          animal={selectedAnimal}
          onClose={() => {
            toggleModal();
            setSelectedAnimal(null);
          }}
        />
      )}
    </Layout>
  );
};

export default ShelterList;
