import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import StateNotice from "../components/layout/StateNotice";
import ShelterAnimalItem from "../components/shelter/ShelterAnimalItem";
import ShelterAnimalModalDetail from "../components/shelter/ShelterAnimalModalDetail";
import useShelterData from "../hooks/useShelterData";
import { useModal } from "../contexts/ModalContext";

const ShelterAnimalList = () => {
  const { animals, error, loading } = useShelterData();
  const { name, addr } = useParams();

  const { isActive, toggleModal } = useModal();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // 최신순 기본

  const decodedName = decodeURIComponent(name);
  const decodedAddr = decodeURIComponent(addr);

  // 날짜 문자열 파싱 함수
  const parseDate = (str) => {
    if (!str || str.length !== 8) return new Date(0);
    const year = parseInt(str.slice(0, 4));
    const month = parseInt(str.slice(4, 6)) - 1;
    const day = parseInt(str.slice(6, 8));
    return new Date(year, month, day);
  };

  // 필터 + 정렬
  const getFilteredData = () => {
    const filtered = animals.filter((a) => {
      const sName = a.SHTER_NM?.trim();
      const sAddr = a.REFINE_ROADNM_ADDR?.trim() || a.REFINE_LOTNO_ADDR?.trim();
      return sName === decodedName && sAddr === decodedAddr;
    });

    return filtered.sort((a, b) => {
      const dateA = parseDate(a.RECEPT_DE); // 입소일자 기준
      const dateB = parseDate(b.RECEPT_DE);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const items = loading || error ? [] : getFilteredData();

  return (
    <Layout width="wide">
      <PageHeading
        title="해당 보호소 유기동물"
        /* 어느 보호소를 보고 있는지 제목만으로는 알 수 없었다 */
        description={`${decodedName} · ${decodedAddr}`}
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
        <StateNotice message="이 보호소에 등록된 유기동물이 없어요." />
      )}

      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ShelterAnimalItem
              key={item.ABDM_IDNTFY_NO}
              petAge={item.AGE_INFO}
              petColor={item.COLOR_NM}
              petType={item.SPECIES_NM}
              petMissingDate={item.RECEPT_DE}
              imageUrl={item.IMAGE_COURS}
              onClick={() => {
                setSelectedAnimal(item);
                toggleModal();
              }}
            />
          ))}
        </div>
      )}

      {isActive && selectedAnimal && (
        <ShelterAnimalModalDetail
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

export default ShelterAnimalList;
