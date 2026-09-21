import { Link } from "react-router-dom";

/* 로그인·회원가입 전용 껍데기.
   이 두 화면은 앱 헤더(마이페이지·알림)를 쓸 일이 없어 Layout을 쓰지 않는다.
   장식 이미지는 -z-10 + pointer-events-none으로 콘텐츠 뒤에 깔아,
   예전처럼 입력칸이나 버튼을 덮는 일이 생기지 않게 한다. */
const AuthLayout = ({ title, description, children, footer }) => (
  <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-page px-4 py-12">
    {/* -z-10을 주면 부모의 배경색 뒤로 들어가 보이지 않는다.
        DOM 순서대로 쌓이게 두고, 뒤따르는 내용에 relative를 줘서 위에 얹는다 */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <img
        src="/bg-icon.png"
        alt=""
        className="absolute -top-8 -left-12 w-44 opacity-50 sm:w-60"
      />
      <img
        src="/bg-icon.png"
        alt=""
        className="absolute right-[-3rem] bottom-24 w-52 rotate-12 opacity-40 sm:w-72"
      />
      <img
        src="/Menu-icon1.png"
        alt=""
        className="absolute bottom-6 left-6 hidden w-40 opacity-70 lg:block"
      />
    </div>

    <Link
      to="/"
      aria-label="PetRadar 홈"
      className="relative rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <img src="/PetRadar-Logo-m.png" alt="PetRadar" className="h-8 w-auto" />
    </Link>

    <div className="relative mt-8 w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </div>

    {footer && <div className="relative mt-6 w-full max-w-sm">{footer}</div>}
  </div>
);

export default AuthLayout;
