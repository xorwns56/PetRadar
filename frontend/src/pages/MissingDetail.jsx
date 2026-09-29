import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import StateNotice from "../components/layout/StateNotice";
import Button from "../components/ui/Button";
import ShelterMatches from "../components/missing/ShelterMatches";
import StaticPointMap from "../components/ui/StaticPointMap";
import { fetchMissingDetail } from "../api/missing";
import { useAuth } from "../contexts/AuthContext";
import { petTypeLabel, petGenderLabel } from "../utils/pet-label";
import { toMessage } from "../utils/error";

/**
 * 실종 글 상세.
 *
 * 예전에는 목록과 지도에서 모달로 띄웠다. 그런데 실종 글은 "잠깐 들여다보고
 * 닫는" 것이 아니라 남에게 보내서 보게 하는 것이다. 모달이라 글마다 주소가
 * 없어 전단을 공유할 수 없었고, 새로고침하면 닫히고 뒤로가기로도 못 돌아왔다.
 * 보호소 후보까지 붙으면서 작은 상자에 담기지도 않게 됐다.
 *
 * 다른 모달(보호소 상세, 보호동물 상세, 받은 제보)은 그대로 둔다.
 * 그쪽은 목록을 떠나지 않고 훑는 동작이라 모달이 맞다.
 */
const MissingDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { userId } = useAuth();

  const [missing, setMissing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMissingDetail(id)
      .then((data) => {
        if (!cancelled) setMissing(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch missing detail:", err);
        setError(toMessage(err, "실종 신고를 불러오지 못했어요."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout width="default">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface" />
          <div className="space-y-3">
            <div className="h-8 w-1/2 animate-pulse rounded-lg bg-surface" />
            <div className="h-20 animate-pulse rounded-xl bg-surface" />
            <div className="h-32 animate-pulse rounded-xl bg-surface" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !missing) {
    return (
      <Layout width="default">
        <StateNotice
          message={error || "실종 신고를 찾을 수 없어요."}
          actionText="실종 목록으로"
          onAction={() => nav("/missingList")}
        />
      </Layout>
    );
  }

  const isMine = userId === missing.userId;

  return (
    <Layout width="default">
      {/* 넓은 화면에서는 사진과 정보를 나란히 둔다. 모달에서는 사진이
          위를 차지해 정작 읽을 내용이 접혀 있었다 */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* 사진과 실종 장소를 한 칸에 쌓는다. 지도를 오른쪽 글 사이에 끼우면
            글이 길 때 왼쪽이 통째로 비어 보였다 */}
        <div className="space-y-4">
          <img
            src={missing.petImage || "/image-default.png"}
            alt=""
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/image-default.png";
            }}
            className="aspect-[4/3] w-full rounded-2xl border border-line bg-brand-soft object-cover"
          />

          {/* 실종 지점. 목격자가 "내가 지나온 길인가"를 가늠하는 데 쓴다.
              주소 문자열은 신고 폼에 입력칸이 없어 늘 비어 있으므로 지도가 유일한 단서다 */}
          {missing.petMissingPoint && (
            <section>
              <h2 className="text-sm font-bold text-ink">실종 장소</h2>
              <div className="mt-2 h-48 overflow-hidden rounded-xl border border-line bg-brand-soft">
                <StaticPointMap point={missing.petMissingPoint} level={5} />
              </div>
              {missing.petMissingPlace && (
                <p className="mt-2 text-xs wrap-anywhere break-keep text-ink-muted">
                  {missing.petMissingPlace}
                </p>
              )}
            </section>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
              {petTypeLabel(missing.petType)}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {missing.petName}
            </h1>
          </div>

          {/* 짧은 값이라 줄마다 쌓기보다 한 줄에 놓는 편이 읽기 쉽다 */}
          <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-page p-3 text-center">
            <div>
              <dt className="text-xs text-ink-muted">성별</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {petGenderLabel(missing.petGender)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">나이</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {missing.petAge}년생
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">실종일</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {missing.petMissingDate}
              </dd>
            </div>
          </dl>

          {missing.petBreed && (
            <p className="mt-4 text-sm text-ink-muted">
              품종 <span className="font-semibold text-ink">{missing.petBreed}</span>
            </p>
          )}

          <h2 className="mt-5 text-lg font-bold wrap-anywhere break-keep text-ink">
            {missing.title}
          </h2>
          {/* 내용이 길어도 이 높이까지만 차지하고 안에서 스크롤한다.
              그대로 두면 본문이 페이지를 지배해 아래 보호소 후보가 멀어진다.
              scroll-visible: macOS는 스크롤바를 숨겨서, 없으면 스크롤이
              있는지조차 알 수 없다 */}
          <div className="scroll-visible mt-2 max-h-72 overflow-y-auto">
            <p className="text-sm leading-relaxed wrap-anywhere break-keep whitespace-pre-line text-ink-muted">
              {missing.content}
            </p>
          </div>

          {isMine ? (
            <div className="mt-6 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => nav(`/missingRevise/${missing.id}`)}
              >
                수정하기
              </Button>
              <Button className="flex-1" onClick={() => nav("/myPage")}>
                받은 제보 보기
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => nav(`/missingReport/${missing.id}`)}
            >
              제보하기
            </Button>
          )}
        </div>
      </div>

      {/* 잃어버린 아이를 찾는 사람이 제일 먼저 확인해야 할 것이
          보호소에 이미 들어와 있는 아이들이다.
          페이지라 폭이 넉넉해 접지 않고 그대로 펼친다 */}
      <ShelterMatches missingPet={missing} />
    </Layout>
  );
};

export default MissingDetail;
