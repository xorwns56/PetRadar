import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import MainMenu from "../components/home/MainMenu";
import MissingMap from "../components/missing/MissingMap";
import NearbyShelterAnimals from "../components/home/NearbyShelterAnimals";
import { fetchMissingPoints } from "../api/missing";

const Home = () => {
  const nav = useNavigate();
  const [missingList, setMissingList] = useState([]);
  // 지도를 움직이면 바뀌는 값이라 지도가 알려준다
  const [visibleCount, setVisibleCount] = useState(null);

  useEffect(() => {
    fetchMissingPoints()
      .then(setMissingList)
      .catch((error) => console.error("Failed to fetch missing list:", error));
  }, []);

  return (
    <Layout width="wide">
      {/* 첫 화면에서 제일 급한 일은 "지금 잃어버렸다"는 신고다.
          설명 옆에 신고 버튼을 바로 두고, 나머지 이동은 아래 카드로 넘긴다 */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
            목격 제보는 실시간으로 알려드려요
          </p>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            길 잃은 아이를
            <br />
            바로 신고해주세요.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            등록한 아이는 아래 지도와 목록에 바로 올라가고,
            <br />
            목격 제보가 들어오면 그 자리에서 알려드려요.
          </p>
          <Button
            size="lg"
            className="mt-8 w-full sm:w-auto"
            onClick={() => nav("/missingDeclaration")}
          >
            실종 신고하기
          </Button>
        </div>

        <img
          src="/Menu-icon1.png"
          alt=""
          className="order-first mx-auto w-40 sm:w-52 lg:order-none lg:w-full lg:max-w-sm"
        />
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <MainMenu
          imgLink="/Menu-icon2.png"
          mainTitle="신고"
          subTitle={
            <>
              사라진 친구를 <br /> 찾아주세요.
            </>
          }
          onclick={() => nav("/missingDeclaration")}
        />
        <MainMenu
          imgLink="/Menu-icon3.png"
          mainTitle="보호소"
          subTitle={
            <>
              근처 보호소 <br /> 확인하기
            </>
          }
          onclick={() => nav("/shelterList")}
        />
        <MainMenu
          imgLink="/Menu-icon4.png"
          mainTitle="실종동물 보기"
          subTitle={
            <>
              실종한 친구 <br /> 찾아보기
            </>
          }
          onclick={() => nav("/missingList")}
        />
      </section>

      {/* 지도는 이 서비스의 본론이라 제목과 건수를 붙여 뭘 보는 화면인지
          먼저 알려준다. 예전에는 테두리만 있는 네모가 놓여 있었다 */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              내 주변에서 찾고 있는 아이들
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              지금 있는 곳을 중심으로 보여드려요. 사진을 누르면 자세한 내용을
              볼 수 있어요.
            </p>
          </div>
          {/* 전체 건수가 아니라 지금 지도에 보이는 건수를 센다.
              "내 주변"을 보여주는 지도 옆에서 전국 합계는 의미가 없다 */}
          {visibleCount !== null && (
            <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-ink">
              {visibleCount > 0
                ? `이 지역 ${visibleCount}건`
                : "이 지역에는 없어요"}
            </span>
          )}
        </div>

        {/* 지도는 스스로 높이를 갖지 못하므로 여기서 정해 준다.
            화면 폭에 따라 단계로 키우되 비율이 아니라 고정 높이를 쓴다 */}
        <div className="h-[280px] overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:h-[340px] lg:h-[380px]">
          <MissingMap
            missingList={missingList}
            onVisibleCountChange={setVisibleCount}
          />
        </div>
      </section>

      {/* 지도에는 실종 지점만 찍고, 보호소 아이들은 사진 카드로 따로 둔다.
          두 마커의 의미가 달라(사건이 난 곳 / 지금 보관 중인 곳)
          한 지도에 섞으면 보호소 위치를 발견 위치로 오해한다 */}
      <NearbyShelterAnimals />
    </Layout>
  );
};

export default Home;
