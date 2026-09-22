import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";

const NotFound = () => {
  const nav = useNavigate();

  return (
    <Layout width="narrow" className="flex flex-col items-center justify-center text-center">
      <p className="text-5xl font-bold tracking-tight text-brand sm:text-6xl">
        404
      </p>
      <h1 className="mt-4 text-xl font-bold text-ink sm:text-2xl">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-2 text-sm leading-relaxed break-keep text-ink-muted">
        페이지가 존재하지 않거나 사용할 수 없는 페이지입니다.
      </p>
      <img
        src="/NotFound-img.png"
        alt=""
        className="my-8 w-48 sm:w-56"
      />
      <Button size="lg" className="w-full" onClick={() => nav("/")}>
        홈으로
      </Button>
    </Layout>
  );
};

export default NotFound;
