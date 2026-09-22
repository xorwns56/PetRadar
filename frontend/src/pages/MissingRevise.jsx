import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import Button from "../components/ui/Button";
import useFormFocus from "../hooks/useFormFocus";
import useMissingForm from "../hooks/useMissingForm";
import MissingForm, { MISSING_FORM_FIELDS } from "../components/missing/MissingForm";
import { fetchMissingDetail, updateMissing } from "../api/missing";

const MissingRevise = () => {
  const params = useParams();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { form, setForm, handleChange, onLocationSelect, buildFormData } =
    useMissingForm();

  useEffect(() => {
    fetchMissingDetail(params.petMissingId)
      .then((data) => setForm({ ...data }))
      .catch((err) => {
        console.error("Failed to fetch missing detail:", err);
        setError("기존 신고 내용을 불러오지 못했어요.");
      });
  }, []);

  const { handleRef, checkInput } = useFormFocus(form, MISSING_FORM_FIELDS);

  const onSubmitButtonClick = async () => {
    if (!checkInput()) return;
    setError("");
    setSubmitting(true);
    try {
      await updateMissing(params.petMissingId, buildFormData());
      nav("/myPage");
    } catch (err) {
      // 예전에는 콘솔에만 남아 사용자는 아무 일도 안 일어난 줄 알았다
      console.error("Failed to update :", err);
      setError("수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout width="content">
      <PageHeading
        title="실종 신고 수정"
        description="고친 내용은 바로 목록과 지도에 반영됩니다."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <MissingForm
        form={form}
        onChange={handleChange}
        handleRef={handleRef}
        onLocationSelect={onLocationSelect}
        mapInit={form.petMissingPoint}
        actions={
          <>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-36"
              onClick={() => nav("/myPage")}
            >
              취소하기
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-36"
              disabled={submitting}
              onClick={onSubmitButtonClick}
            >
              {submitting ? "저장 중…" : "수정하기"}
            </Button>
          </>
        }
      />
    </Layout>
  );
};

export default MissingRevise;
