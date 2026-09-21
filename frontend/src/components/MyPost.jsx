import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import MypageModalDetail from "./MypageModalDetail";
import MyPostReportItem from "./MyPostReportItem";
import MyPostMissingItem from "./MyPostMissingItem";
import Button from "./Button";
import { useModal } from "../hooks/ModalContext";
import { useAuth } from "../contexts/AuthContext.jsx";

const MyPost = () => {
  const nav = useNavigate();
  const { isActive, toggleModal } = useModal();
  const { api } = useAuth();

  const [myMissing, setMyMissing] = useState([]);
  const [petMissingItem, setPetMissingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemSize = 2;
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [modalData, setModalData] = useState(null);

  const onPageClick = (page) => setPage(page);

  useEffect(() => {
    if (isActive) toggleModal();
    const fetchMyMissing = async () => {
      try {
        const response = await api.get("/api/missing/me");
        setMyMissing(response.data);
        if (response.data.length > 0) {
          setPetMissingItem(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch missing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMissing();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [petMissingItem]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!petMissingItem) return; // 반려동물이 선택되지 않았으면 아무것도 가져오지 않음
      try {
        // API 엔드포인트에 petMissingId, page, itemSize를 파라미터로 전달합니다.
        const response = await api.get(
          `/api/report/missing/${petMissingItem.id}`,
          {
            params: { page: page - 1, size: itemSize, sort: "createdAt,desc" },
          }
        );
        setReports(response.data.content);
        setTotalReports(response.data.totalElements);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };
    fetchReports();
  }, [petMissingItem, page]);

  const onDeleteMissing = async () => {
    if (
      !confirm(
        `${petMissingItem.petName}의 실종신고를 정말 삭제하시겠습니까?`
      )
    )
      return;
    try {
      await api.delete(`/api/missing/${petMissingItem.id}`);
      const updatedMissingList = myMissing.filter(
        (item) => item.id !== petMissingItem.id
      );
      setMyMissing(updatedMissingList);
      setPetMissingItem(updatedMissingList[0] ?? null);
    } catch (error) {
      console.error("Failed to delete missing item:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-ink sm:text-2xl">나의 실종신고</h2>

      {loading && (
        <div className="mt-4 h-52 animate-pulse rounded-2xl border border-line bg-surface" />
      )}

      {!loading && myMissing.length === 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-surface px-6 py-14 text-center shadow-card">
          <p className="text-sm text-ink-muted">
            현재 실종신고가 존재하지 않습니다.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => nav("/missingDeclaration")}
          >
            실종 신고하기
          </Button>
        </div>
      )}

      {!loading && myMissing.length > 0 && (
        <>
          {/* 신고한 아이가 여럿이면 골라서 볼 수 있다 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {myMissing.map((item) => (
              <MyPostMissingItem
                key={`petMissing${item.id}`}
                petName={item.petName}
                isActive={item.id === petMissingItem?.id}
                onClick={() => setPetMissingItem(item)}
              />
            ))}
          </div>

          {petMissingItem && (
            <>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
                <p className="min-w-0 flex-1 truncate font-bold text-ink">
                  {petMissingItem.title}
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => nav(`/missingRevise/${petMissingItem.id}`)}
                  >
                    수정
                  </Button>
                  <Button variant="danger" size="sm" onClick={onDeleteMissing}>
                    삭제
                  </Button>
                </div>
              </div>

              <h3 className="mt-8 text-base font-bold text-ink">
                받은 제보
                {totalReports > 0 && (
                  <span className="ml-2 text-brand">{totalReports}</span>
                )}
              </h3>

              {reports.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-line bg-surface px-6 py-10 text-center text-sm text-ink-muted shadow-card">
                  아직 들어온 제보가 없어요.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {reports.map((item) => (
                    <MyPostReportItem
                      key={`petReport${item.id}`}
                      title={item.title}
                      content={item.content}
                      petImage={item.petImage}
                      onClick={() => {
                        setModalData(item);
                        toggleModal();
                      }}
                    />
                  ))}
                </div>
              )}

              <Pagination
                totalItems={totalReports}
                page={page}
                onClick={onPageClick}
                itemSize={itemSize}
              />
            </>
          )}
        </>
      )}

      {modalData && <MypageModalDetail {...modalData} />}
    </section>
  );
};

export default MyPost;
