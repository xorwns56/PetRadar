import Header from "../Header";
import { cn } from "../../utils/cn";

/* 화면마다 따로 쓰던 겉껍데기를 한곳에 모은다.
   예전에는 페이지마다 .Home / .MissingList 같은 클래스에 height:100vh를 주고
   그 안에서 자식 높이를 30% / 28% / 35%처럼 비율로 쪼갰다.
   내용이 조금만 늘어도 넘치거나 잘려서, 화면마다 calc(100vh - 400px) 같은
   숫자를 손으로 맞추고 있었다.

   여기서는 높이를 정하지 않는다. 셸만 화면 높이를 채우고(min-h-dvh)
   내용은 자기 높이만큼 흐르게 둔다. */
const WIDTHS = {
  narrow: "max-w-md", // 로그인·회원가입처럼 한 줄짜리 폼
  content: "max-w-3xl", // 한 단으로 읽어 내려가는 화면(폼·마이페이지)
  default: "max-w-5xl",
  wide: "max-w-6xl", // 지도·카드 격자
};

const Layout = ({ children, width = "default", className }) => {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Header />
      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8 lg:px-8",
          WIDTHS[width],
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
