import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import Button from "../components/ui/Button";
import MissingItem from "../components/missing/MissingItem";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../contexts/AuthContext";
import { fetchMissingList } from "../api/missing";

const MissingList = () => {
  const nav = useNavigate();
  const { userId } = useAuth();

  const [sortType, setSortType] = useState("latest");
  const [searchInput, setSearchInput] = useState("");
  // 입력 중인 글자가 아니라 "조회를 누른 시점의 검색어"로 요청한다
  const [keyword, setKeyword] = useState("");
  const [missingList, setMissingList] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  // 화면은 1부터, 서버(Spring Page)는 0부터 센다
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchMissingList({
        searchInput: keyword,
        sortType,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setMissingList(data.content);
      setTotalItems(data.totalElements);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to fetch missing list:", error);
      setStatus("error");
    }
  }, [keyword, sortType, page]);

  useEffect(() => {
    load();
  }, [load]);

  /* 검색어나 정렬이 바뀌면 첫 쪽으로 돌아간다.
     3쪽을 보다가 검색하면 결과가 1쪽뿐이라 빈 화면이 된다 */
  const onSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const onReset = () => {
    setSearchInput("");
    setKeyword("");
    setPage(1);
  };

  const onSortChange = (value) => {
    setSortType(value);
    setPage(1);
  };

  const isSearching = keyword.trim().length > 0;
  const control =
    "h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-brand focus:outline-none disabled:bg-page disabled:text-ink-muted";

  return (
    <Layout width="wide">
      <PageHeading
        title="실종 동물 목록"
        description="사진을 누르면 상세 내용을 볼 수 있어요."
        actions={
          <Button onClick={() => nav("/missingDeclaration")}>실종 신고</Button>
        }
      />

      {/* form으로 감싸 Enter로도 조회된다.
          예전에는 버튼을 눌러야만 요청이 나갔다 */}
      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-3 shadow-card"
      >
        <label className="sr-only" htmlFor="missing-sort">
          정렬 기준
        </label>
        <select
          id="missing-sort"
          value={sortType}
          onChange={(e) => onSortChange(e.target.value)}
          disabled={isSearching}
          title={
            isSearching ? "검색 결과는 관련도 순으로 보여드려요." : undefined
          }
          className={`${control} w-28 shrink-0`}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된 순</option>
        </select>

        <label className="sr-only" htmlFor="missing-search">
          검색어
        </label>
        <input
          id="missing-search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="품종, 제목, 실종 장소로 검색"
          className={`${control} min-w-0 flex-1`}
        />

        {isSearching && (
          <Button variant="ghost" onClick={onReset}>
            초기화
          </Button>
        )}
        <Button htmlType="submit">조회</Button>
      </form>

      {status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 뼈대를 먼저 깔아 목록이 도착할 때 화면이 덜 튀게 한다 */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-line bg-surface"
            />
          ))}
        </div>
      )}

      {status === "ready" && (
        <Pagination
          totalItems={totalItems}
          page={page}
          itemSize={PAGE_SIZE}
          onClick={(next) => {
            setPage(next);
            // 쪽을 넘기면 목록 맨 위부터 보게 한다
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center shadow-card">
          <p className="text-sm text-ink-muted">목록을 불러오지 못했어요.</p>
          <Button variant="secondary" className="mt-4" onClick={load}>
            다시 시도
          </Button>
        </div>
      )}

      {status === "ready" && missingList.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center shadow-card">
          <p className="text-sm text-ink-muted">
            {isSearching
              ? `'${keyword}'에 대한 결과가 없어요.`
              : "아직 등록된 실종 신고가 없어요."}
          </p>
          {isSearching ? (
            <Button variant="secondary" className="mt-4" onClick={onReset}>
              전체 목록 보기
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => nav("/missingDeclaration")}
            >
              실종 신고하기
            </Button>
          )}
        </div>
      )}

      {status === "ready" && missingList.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {missingList.map((item) => (
            <MissingItem
              key={item.id}
              missingDTO={item}
              onOpen={() => nav(`/missing/${item.id}`)}
              onClick={() => nav(`/missingReport/${item.id}`)}
              myMissing={userId === item.userId}
            />
          ))}
        </div>
      )}

      {status === "ready" && (
        <Pagination
          totalItems={totalItems}
          page={page}
          itemSize={PAGE_SIZE}
          onClick={(next) => {
            setPage(next);
            // 쪽을 넘기면 목록 맨 위부터 보게 한다
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

    </Layout>
  );
};

export default MissingList;
