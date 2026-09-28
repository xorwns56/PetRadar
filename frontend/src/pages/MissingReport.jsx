import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import Button from "../components/ui/Button";
import LocationMap from "../components/missing/LocationMap";
import ImageField from "../components/ui/ImageField";
import FormField, { controlClass, textareaClass } from "../components/ui/FormField";
import { createReport } from "../api/report";
import { useAuth } from "../contexts/AuthContext";
import { toMessage } from "../utils/error";

const MissingReport = () => {
  const nav = useNavigate();
  const params = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    petImage: null, // 파일 객체를 그대로 담는다
    petReportPlace: "",
    petReportPoint: null,
  });
  const { isAuthenticated } = useAuth();

  // 제보에도 작성자를 남기므로 서버가 인증을 요구한다.
  // 다 적고 나서 막히지 않도록 들어올 때 돌려보낸다
  useEffect(() => {
    if (!isAuthenticated) {
      alert("목격 제보에는 로그인이 필요합니다.");
      nav("/login", { replace: true });
    }
  }, [isAuthenticated, nav]);

  const onSubmitButtonClick = async () => {
    if (!form.title || !form.content) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // 이미지는 파일 파트로 따로 보내므로 JSON 본문에서 분리한다
      const { petReportPoint, petImage, ...restOfForm } = form;
      const requestBody = {
        ...restOfForm,
        latitude: petReportPoint ? petReportPoint.lat : null,
        longitude: petReportPoint ? petReportPoint.lng : null,
      };
      // multipart: report(JSON) + image(File)
      const formData = new FormData();
      formData.append(
        "report",
        new Blob([JSON.stringify(requestBody)], { type: "application/json" })
      );
      if (petImage) formData.append("image", petImage);

      await createReport(params.petMissingId, formData);
      nav("/missingList");
    } catch (err) {
      console.error("Failed to submit report:", err);
      setError(toMessage(err, "제보 등록에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "petImage") {
      if (!files[0]) return;
      // base64 변환 없이 파일 객체를 그대로 보관한다
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onLocationSelect = (latlng) => {
    setForm((prev) => ({
      ...prev,
      petReportPoint: { lat: latlng.lat, lng: latlng.lng },
    }));
  };

  return (
    <Layout width="content">
      <PageHeading
        title="실종 동물 제보하기"
        description="글쓴이에게 바로 알림이 갑니다. 작은 단서도 도움이 돼요."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        {/* 한 단으로 세운다 — 적는 순서가 곧 읽는 순서가 되게 */}
        <div className="flex flex-col gap-5">
          <FormField label="제목" htmlFor="report-title">
            <input
              id="report-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="어디서 보셨는지 한 줄로 적어주세요."
              className={controlClass}
            />
          </FormField>

          <FormField label="내용" htmlFor="report-content">
            <textarea
              id="report-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="상세한 설명을 적어주세요."
              className={`${textareaClass} min-h-40`}
            />
          </FormField>

          <FormField
            label="발견 장소"
            hint="장소를 검색하거나 지도를 직접 눌러 찍어주세요."
          >
            <LocationMap onSelect={onLocationSelect} />
          </FormField>

          <FormField label="사진" htmlFor="report-image">
            <ImageField
              id="report-image"
              value={form.petImage}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            className="w-full sm:w-44"
            disabled={submitting}
            onClick={onSubmitButtonClick}
          >
            {submitting ? "등록 중…" : "제보하기"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MissingReport;
