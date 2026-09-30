import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PageHeading from "../components/layout/PageHeading";
import Button from "../components/ui/Button";
import useFormFocus from "../hooks/useFormFocus";
import useMissingForm from "../hooks/useMissingForm";
import MissingForm, { MISSING_FORM_FIELDS } from "../components/missing/MissingForm";
import { useAuth } from "../contexts/AuthContext";
import { createMissing } from "../api/missing";
import { toMessage } from "../utils/error";

const MissingDeclaration = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

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
      await createMissing(buildFormData());
      nav("/missingList");
    } catch (err) {
      console.error("Failed to submit missing:", err);
      setError(toMessage(err, "신고 제출에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Layout width="content">
      <PageHeading
        title="실종 동물 신고"
        description="등록하면 홈 지도와 목록에 바로 올라가고, 보호소에 비슷한 아이가 들어오면 알려드려요."
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
