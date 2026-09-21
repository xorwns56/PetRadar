import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";

/* 헤더는 스크롤해도 따라온다. 목록이 길어졌을 때 뒤로가기·알림에
   닿으려고 맨 위까지 올라가야 했던 문제를 없앤다.

   예전에는 좌 35% / 중앙 30% / 우 35%로 폭을 나눠 로고를 가운데 맞췄는데,
   양쪽 내용 길이가 달라지면 로고가 조금씩 어긋났다.
   로고를 왼쪽에 두고(그 자체가 홈 링크다) 조작은 오른쪽에 모은다. */
const Header = () => {
  const { toggleSidebar, alerts } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  const isHome = location.pathname === "/";
  const alertCount = alerts?.length ?? 0;

  const pill =
    "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <header className="sticky top-0 z-40 bg-brand text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-3 sm:px-6 lg:px-8">
        {!isHome && (
          <button
            type="button"
            aria-label="이전 화면으로"
            onClick={() => nav(-1)}
            className="-ml-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <img src="/Prev-btn.png" alt="" className="h-4 w-auto" />
          </button>
        )}

        <Link
          to="/"
          aria-label="PetRadar 홈"
          className="inline-flex h-10 items-center rounded-lg px-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <img src="/PetRadar-Logo-w.png" alt="PetRadar" className="h-5 w-auto sm:h-6" />
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to={isAuthenticated ? "/myPage" : "/login"} className={pill}>
            {isAuthenticated ? "마이페이지" : "로그인"}
          </Link>

          {isAuthenticated && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={
                alertCount > 0 ? `알림 ${alertCount}건 열기` : "알림 열기"
              }
              className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {/* 예전에는 CSS에서 url(/public/Msg-Bell.png)로 불렀는데
                  Vite는 public/을 루트로 펴서 내보내므로 그 경로가 없었다.
                  즉 종 아이콘이 한 번도 보이지 않았다 */}
              <img src="/Msg-Bell.png" alt="" className="size-5" />
              {/* 0건일 때는 배지를 띄우지 않는다 */}
              {alertCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center",
                    "rounded-full bg-white px-1.5 text-xs font-bold text-brand",
                    "h-5 ring-2 ring-brand"
                  )}
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
