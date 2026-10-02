import { useEffect, useState } from "react";
import { fetchShelterMatches } from "../../api/shelter";
import { useShelterQuery } from "../../hooks/useShelterData";
import { toRegionName } from "../../lib/kakaoMap";
import { formatPublicDate, formatSex } from "../../utils/shelter-label";

/**
 * 실종 글 아래에 붙는 "보호소에 있는 비슷한 아이".
 *
 * 글을 열 때마다 그 시점 데이터로 다시 계산하므로 따로 갱신할 것이 없다.
 * 입양·반환된 아이는 다음 조회부터 저절로 빠진다.
 *
 * 다만 지금은 신고자가 글을 열어야 확인할 수 있다. 새로 들어온 아이를
 * 알림으로 알려주려면 서버가 이전 상태와 비교해야 한다.
 */
const ShelterMatches = ({ missingPet }) => {
  /* 지역은 신고할 때 저장해 둔 값을 쓴다.
     그게 없는 예전 글만 좌표에서 다시 구한다 — 서버에는 지오코더가 없어
     스케줄러도 저장된 값을 쓰므로, 화면과 알림이 같은 기준을 보게 된다 */
  const [region, setRegion] = useState(undefined);
  useEffect(() => {
    if (missingPet.region) {
      setRegion(missingPet.region);
      return;
    }
    const point = missingPet.petMissingPoint;
    if (!point?.lat || !point?.lng) {
      setRegion(null);
      return;
    }
    let cancelled = false;
    toRegionName(point.lat, point.lng)
      .then((name) => {
        if (!cancelled) setRegion(name);
      })
      .catch(() => {
        if (!cancelled) setRegion(null);
      });
    return () => {
      cancelled = true;
    };
  }, [missingPet.region, missingPet.petMissingPoint]);

  const { data: matches, error, loading } = useShelterQuery(
    () => fetchShelterMatches({ missingId: missingPet.id, region }),
    [missingPet.id, region],
    region !== undefined // 지역이 정해지기 전에 부르면 전국으로 한 번 헛돈다
  );

  // 실패했으면 조용히 접는다. 글 자체를 읽는 데 지장을 주면 안 된다
  if (error) return null;

  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="text-lg font-bold text-ink">보호소에 있는 비슷한 아이</h2>
      <p className="mt-1 text-sm leading-relaxed break-keep text-ink-muted">
        {region
          ? `${region} 관할로 접수된 아이들 중, 실종일 이후 들어온 같은 종이에요.`
          : "실종일 이후 보호소에 들어온 같은 종이에요."}
      </p>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-page"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="mt-4 rounded-xl bg-page px-3 py-6 text-center text-sm text-ink-muted">
          아직 비슷한 아이가 보호소에 없어요.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {matches.map((animal) => (
            <li key={animal.desertionNo}>
              {/* 공공 API가 개체별 상세 주소를 주지 않아 링크할 곳이 없다.
                  대신 어느 보호소인지와 연락처를 툴팁으로 붙인다 */}
              <div
                className="overflow-hidden rounded-xl border border-line bg-surface"
                title={`${animal.careName} · ${animal.careTel}`}
              >
                <img
                  /* 공공 API는 원본(popfile1)과 썸네일(popfile2)을 함께 준다.
                     카드 크기에 원본을 쓰면 장당 수 MB를 받느라 늦게 뜬다.
                     썸네일이 없는 개체가 있어 원본으로 떨어뜨린다 */
                  src={animal.thumbnailUrl || animal.imageUrl || "/image-default.png"}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/image-default.png";
                  }}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-2">
                  <p className="truncate text-xs font-semibold text-ink">
                    {animal.breed}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                    {formatSex(animal.sex)} · {formatPublicDate(animal.foundDate)}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                    {animal.orgNm}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ShelterMatches;
