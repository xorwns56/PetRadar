import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import StateNotice from "../components/layout/StateNotice";
import ShelterAnimalItem from "../components/shelter/ShelterAnimalItem";
import ShelterAnimalModalDetail from "../components/shelter/ShelterAnimalModalDetail";
import { fetchShelterAnimals } from "../api/shelter";
import { useShelterQuery } from "../hooks/useShelterData";
import { useModal } from "../contexts/ModalContext";

/**
 * 한 보호소의 보호동물.
 *
 * 예전에는 보호소 이름과 주소를 URL에 싣고, 받아온 100건을 화면에서
 * 이름·주소가 같은 것만 걸러 썼다. 그래서 그 100건 안에 우연히 들어온
 * 몇 마리만 보였다. 지금은 보호소 등록번호로 서버에 직접 묻는다.
 */
const ShelterAnimalList = () => {
  const { careRegNo } = useParams();
  const { isActive, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

  const {
    data: animals,
    error,
    loading,
  } = useShelterQuery(() => fetchShelterAnimals(careRegNo), [careRegNo]);

  // 발견일은 "20260928" 형태라 문자열 비교로 그대로 정렬된다
  const items = useMemo(
    () =>
      [...animals].sort((a, b) =>
        sortOrder === "newest"
          ? (b.foundDate ?? "").localeCompare(a.foundDate ?? "")
          : (a.foundDate ?? "").localeCompare(b.foundDate ?? "")
      ),
    [animals, sortOrder]
  );

  const shelterName = animals[0]?.careName;
  const shelterAddress = animals[0]?.careAddress;

  return (
    <Layout width="wide">
      <PageHeading
        title="보호소 유기동물"
        /* 어느 보호소를 보고 있는지 제목만으로는 알 수 없었다 */
        description={
          shelterName ? `${shelterName} · ${shelterAddress}` : "보호 중인 아이들이에요."
        }
        actions={
          <>
            <label className="sr-only" htmlFor="animal-sort">
              정렬 기준
            </label>
            <select
              id="animal-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-11 w-28 rounded-xl border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </>
        }
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-line bg-surface"
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

      {!loading && !error && items.length === 0 && (
        <StateNotice message="이 보호소에 보호 중인 유기동물이 없어요." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((animal) => (
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
    </Layout>
  );
};

export default ShelterAnimalList;
