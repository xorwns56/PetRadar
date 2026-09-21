import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import Button from "../components/Button";
import useFormFocus from "../hooks/useFormFocus";
import useMissingForm from "../hooks/useMissingForm";
import MissingForm, { MISSING_FORM_FIELDS } from "../components/MissingForm";
import { useAuth } from "../contexts/AuthContext";

const MissingDeclaration = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, api } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      alert("실종 신고에는 로그인이 필요합니다.");
      nav("/login", { replace: true });
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, nav]);

  const { form, handleChange, onLocationSelect, buildFormData } =
    useMissingForm();
  const { handleRef, checkInput } = useFormFocus(form, MISSING_FORM_FIELDS);

  const onSubmitButtonClick = async () => {
    if (!checkInput()) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/missing", buildFormData());
      nav("/missingList");
    } catch (err) {
      console.error("Failed to submit missing:", err);
      setError("신고 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Layout width="content">
      <PageHeading
        title="실종 동물 신고"
        description="등록하면 근처 이웃들에게 바로 알림이 갑니다."
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
        actions={
          <Button
            size="lg"
            className="w-full sm:w-44"
            disabled={submitting}
            onClick={onSubmitButtonClick}
          >
            {submitting ? "등록 중…" : "신고하기"}
          </Button>
        }
      />
    </Layout>
  );
};

export default MissingDeclaration;
