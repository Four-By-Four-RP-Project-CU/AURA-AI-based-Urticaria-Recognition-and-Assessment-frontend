import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Progress,
  Textarea,
  TextInput,
} from "flowbite-react";
import { FaArrowLeft, FaChartBar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import { getUncertaintyLevel } from "../../utils/activeLearningUtils";
import ActiveLearningStepsSidebar from "../../components/active-learning/ActiveLearningStepsSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import Dropdown from "../../components/active-learning/Dropdown";

const FEEDBACK_KEY = "activeLearningFeedback";
const OVERRIDES_KEY = "activeLearningCaseOverrides";

const TREATMENT_STEPS = [
  {
    value: "STEP_1",
    label: "STEP_1 (standard dose 2nd gen antihistamine)",
  },
  {
    value: "STEP_2",
    label: "STEP_2 (up-dose antihistamine)",
  },
  {
    value: "STEP_3",
    label: "STEP_3 (add-on biologic like omalizumab)",
  },
  {
    value: "STEP_4",
    label: "STEP_4 (add-on immunosuppressant like cyclosporine)",
  },
];

const DRUG_OPTIONS = [
  { value: "SECOND_GEN_ANTIHISTAMINE", label: "Second gen antihistamine" },
  { value: "UPDOSED_ANTIHISTAMINE", label: "Updosed antihistamine" },
  { value: "ANTIHISTAMINE_PLUS_ADJUNCT", label: "Antihistamine + adjunct" },
  { value: "OMALIZUMAB", label: "Omalizumab" },
  { value: "CYCLOSPORINE", label: "Cyclosporine" },
  { value: "SHORT_COURSE_STEROID", label: "Short course steroid" },
  { value: "OTHER", label: "Other (specify)" },
];

const ReviewCaseDetailPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [selectedStep, setSelectedStep] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("");
  const [otherDrugText, setOtherDrugText] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const getConfidencePercent = (item) => {
    if (typeof item?.overallConfidenceScore === "number") {
      return Math.round(item.overallConfidenceScore * 100);
    }
    if (typeof item?.confidence === "number") {
      return Math.round(item.confidence <= 1 ? item.confidence * 100 : item.confidence);
    }
    return null;
  };

  const getUncertaintyLabel = (item) => {
    const confidence = getConfidencePercent(item);
    if (confidence === null) return "Unknown";
    return getUncertaintyLevel(confidence);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const toNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const formatPercent = (value) => {
    const numericValue = toNumber(value);
    if (numericValue === null) return "—";
    const normalized = numericValue <= 1 ? numericValue * 100 : numericValue;
    return `${Math.round(normalized)}%`;
  };

  const getProgressValue = (value) => {
    const numericValue = toNumber(value);
    if (numericValue === null) return 0;
    const normalized = numericValue <= 1 ? numericValue * 100 : numericValue;
    return Math.min(Math.max(Math.round(normalized), 0), 100);
  };

  const getStatusColor = (status) => {
    if (status === "REVIEWED") return "success";
    if (status === "RETRAINED") return "info";
    if (status === "NEED_REVIEW" || status === "NEEDS_REVIEW") return "warning";
    return "warning";
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === "HIGH") return "failure";
    if (riskLevel === "MEDIUM") return "warning";
    if (riskLevel === "LOW") return "success";
    return "gray";
  };

  const normalizeOptionValue = (value) => {
    if (typeof value !== "string") return "";
    return value
      .trim()
      .toUpperCase()
      .replace(/\+/g, "PLUS")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const buildUrl = (baseUrl, path) => {
    if (!baseUrl) return path;
    if (baseUrl.endsWith("/") && path.startsWith("/")) {
      return `${baseUrl.slice(0, -1)}${path}`;
    }
    if (!baseUrl.endsWith("/") && !path.startsWith("/")) {
      return `${baseUrl}/${path}`;
    }
    return `${baseUrl}${path}`;
  };

  const isOtherDrugSelected = () => {
    if (selectedDrug === "OTHER") return true;
    const predicted = normalizeOptionValue(caseData?.predictedDrug);
    return predicted === "OTHER";
  };

  const buildFeedbackPayload = ({ clinicianFinalDecision }) => {
    const genderValue =
      caseData?.patientGender || caseData?.gender || caseData?.sex || null;
    const basePayload = {
      patientAge: caseData?.patientAge ?? null,
      patientGender: genderValue,
      uct: caseData?.uct || null,
      aect: caseData?.aect || null,
      predictedDrug: caseData?.predictedDrug || null,
      predictedStep: caseData?.predictedStep || null,
      confidencePredictedDrugStep:
        caseData?.confidencePredictedDrugStep ?? null,
      clinicianFinalDecision,
      reviewedBy: reviewerName,
      comment: comment.trim() || "No comment",
    };

    if (clinicianFinalDecision === "CORRECTED") {
      basePayload.correctedDrug =
        selectedDrug === "OTHER" ? otherDrugText.trim() : selectedDrug || null;
      basePayload.correctedStep = selectedStep || null;
    }

    return basePayload;
  };

  useEffect(() => {
    const controller = new AbortController();
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const requestUrl = caseId
      ? `${baseUrl}/api/v1/dashboard-review/${encodeURIComponent(caseId)}`
      : "";

    const fetchCase = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        if (!requestUrl) {
          throw new Error("Missing case ID.");
        }
        const headers = {};
        const basicAuth = import.meta.env.VITE_DASHBOARD_REVIEW_BASIC_AUTH;
        if (basicAuth) {
          headers.Authorization = `Basic ${basicAuth}`;
        }
        const response = await fetch(requestUrl, {
          headers,
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload = await response.json();
        const baseCase = Array.isArray(payload)
          ? payload.find((item) => item.caseId === caseId)
          : Array.isArray(payload?.data)
            ? payload.data.find((item) => item.caseId === caseId)
            : payload?.record ||
              payload?.case ||
              payload?.data ||
              payload;
        if (!baseCase) {
          setCaseData(null);
          return;
        }
        const overrides = JSON.parse(
          window.localStorage.getItem(OVERRIDES_KEY) || "{}"
        );
        const merged = { ...baseCase, ...(overrides[caseId] || {}) };
        setCaseData(merged);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "Failed to load case.");
          setCaseData(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();

    const storedFeedback = JSON.parse(
      window.localStorage.getItem(FEEDBACK_KEY) || "[]"
    );
    setFeedbackEntries(storedFeedback.filter((entry) => entry.caseId === caseId));

    return () => controller.abort();
  }, [caseId]);

  useEffect(() => {
    if (!caseData) return;
    if (!selectedStep && caseData.predictedStep) {
      const normalized = normalizeOptionValue(caseData.predictedStep);
      if (TREATMENT_STEPS.some((option) => option.value === normalized)) {
        setSelectedStep(normalized);
      }
    }
    if (!selectedDrug && caseData.predictedDrug) {
      const normalized = normalizeOptionValue(caseData.predictedDrug);
      if (DRUG_OPTIONS.some((option) => option.value === normalized)) {
        setSelectedDrug(normalized);
      }
    }
  }, [caseData, selectedDrug, selectedStep]);

  const reviewerName = "Dr. Perera";

  const decisionStatus = useMemo(() => {
    if (!caseData) return "NEED_REVIEW";
    if (caseData.clinicianFinalStatus) return caseData.clinicianFinalStatus;
    const confidence = getConfidencePercent(caseData);
    if (confidence === null) return "NEED_REVIEW";
    if (caseData.threshold) {
      return confidence < caseData.threshold ? "NEED_REVIEW" : "AUTO_ACCEPTED";
    }
    return "NEED_REVIEW";
  }, [caseData]);

  const reviewedCount = useMemo(() => {
    const storedFeedback = JSON.parse(
      window.localStorage.getItem(FEEDBACK_KEY) || "[]"
    );
    return storedFeedback.length;
  }, [feedbackEntries]);

  const updateOverrides = (updates) => {
    const overrides = JSON.parse(
      window.localStorage.getItem(OVERRIDES_KEY) || "{}"
    );
    const next = {
      ...overrides,
      [caseId]: { ...(overrides[caseId] || {}), ...updates },
    };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    setCaseData((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const handleDecision = async () => {
    if (!selectedAction) {
      setErrorMessage("Select an action before submitting.");
      return;
    }
    if (
      selectedAction === "Corrected" &&
      selectedDrug === "OTHER" &&
      !otherDrugText.trim()
    ) {
      setErrorMessage("Provide the other drug name before submitting.");
      return;
    }

    const action = selectedAction;
    const entry = {
      caseId,
      originalPrediction: caseData.predictedLabel,
      clinicianAction: action,
      treatmentStep: selectedStep || "N/A",
      treatmentDrug: selectedDrug || "N/A",
      otherDrug: otherDrugText.trim() || "N/A",
      comment: comment.trim() || "No comment",
      timestamp: new Date().toISOString(),
      reviewerName,
    };

    const storedFeedback = JSON.parse(
      window.localStorage.getItem(FEEDBACK_KEY) || "[]"
    );
    const nextFeedback = [entry, ...storedFeedback];
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(nextFeedback));
    setFeedbackEntries(nextFeedback.filter((item) => item.caseId === caseId));

    updateOverrides({ status: "REVIEWED" });
    setSelectedAction("");
    setSelectedStep("");
    setSelectedDrug("");
    setOtherDrugText("");
    setComment("");
    setErrorMessage("");
    toast.success("Clinician decision saved.");

    const clinicianFinalDecision = action.toUpperCase();
    const payload = buildFeedbackPayload({ clinicianFinalDecision });
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const feedbackUrl = buildUrl(
      baseUrl,
      `/api/v1/dashboard-review/${encodeURIComponent(caseId)}/clinician-feedback`
    );
    const headers = {
      "Content-Type": "application/json",
    };
    const basicAuth = import.meta.env.VITE_DASHBOARD_REVIEW_BASIC_AUTH;
    if (basicAuth) {
      headers.Authorization = `Basic ${basicAuth}`;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(feedbackUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const responseBody = await response
        .json()
        .catch(() => ({}));
      if (!response.ok || responseBody?.success === false) {
        const message =
          responseBody?.message ||
          `Feedback request failed with ${response.status}`;
        throw new Error(message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit retrain feedback."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell
        header={
          <div className="mb-6 flex items-center gap-3">
            <Button
              color="gray"
              onClick={() => navigate("/active-learning/review")}
              aria-label="Back to queue"
            >
              <FaArrowLeft />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Case Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Loading Case
              </h1>
            </div>
          </div>
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">Loading case details...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!caseData) {
    return (
      <DashboardShell
        header={
          <div className="mb-6 flex items-center gap-3">
            <Button
              color="gray"
              onClick={() => navigate("/active-learning/review")}
              aria-label="Back to queue"
            >
              <FaArrowLeft />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Case Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Case Not Found
              </h1>
            </div>
          </div>
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">
            {loadError ? `${loadError} ` : ""}Case not found. Return to the review queue.
          </p>
          <Button
            className="mt-4"
            color="gray"
            onClick={() => navigate("/active-learning/review")}
            aria-label="Back to queue"
          >
            <FaArrowLeft />
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const header = (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        Case Detail
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            color="gray"
            pill
            size="sm"
            className="h-10 w-10 !p-1"
            onClick={() => navigate("/active-learning/review")}
            aria-label="Back to queue"
          >
            <FaArrowLeft className="text-base" />
          </Button>
          <h1 className="text-3xl font-semibold text-slate-900">
            {caseData.caseId}
          </h1>
          <Badge color={getStatusColor(caseData.clinicianFinalStatus || caseData.status)}>
            {caseData.clinicianFinalStatus || caseData.status || "—"}
          </Badge>
        </div>
        {/* <div className="rounded-xl bg-white p-2">
          <div className="flex items-center gap-2">
            <Button
              color="info"
              pill
              size="sm"
              className="h-10 w-10 !p-0"
              onClick={() => navigate("/active-learning/review")}
              aria-label="Back to Queue"
            >
              <FaArrowLeft className="text-base" />
            </Button>
            <Button
              color="gray"
              pill
              size="sm"
              className="h-10 w-10 !p-0"
              onClick={() => navigate("/active-learning/status")}
              aria-label="Status Overview"
            >
              <FaChartBar className="text-base" />
            </Button>
          </div>
        </div> */}
      </div>
      <p className="mt-2 text-slate-600">
        Review workflow for clinician validation and active learning.
      </p>
    </div>
  );

  return (
    <DashboardShell header={header}>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Clinical Summary</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {caseData.hospital || "—"}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Case ID
                </p>
                <p className="text-sm text-slate-700">{caseData.caseId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Visit Date
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(caseData.visitDate || caseData.date)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Patient
                </p>
                <p className="text-sm text-slate-700">
                  {caseData.patientAge ?? caseData.age ?? "—"} / {caseData.patientGender ?? caseData.sex ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Symptoms
                </p>
                <p className="text-sm text-slate-700">{caseData.symptoms || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Urticaria Type
                </p>
                <p className="text-sm text-slate-700">
                  {caseData.urticariaType || caseData.predictedLabel || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Treatment Model Output</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {caseData.predictedDrug || caseData.predictedLabel || "—"}
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Drug Confidence</span>
                <span className="font-semibold text-slate-900">
                  {formatPercent(caseData.confidencePredictedDrugStep)}
                </span>
              </div>
              <Progress
                progress={getProgressValue(caseData.confidencePredictedDrugStep)}
                color="cyan"
                size="sm"
              />
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Predicted Step</span>
                <span className="font-semibold text-slate-900">
                  {caseData.predictedStep || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Urticaria Type</span>
                <span className="font-semibold text-slate-900">
                  {caseData.urticariaType || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Risk Model Output</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Overall Confidence & Risks
                </h2>
                <p className="text-sm text-slate-600">
                  Updated {formatDateTime(caseData.updatedAt || caseData.createdAt)}
                </p>
              </div>
              <Badge
                color={getStatusColor(caseData.clinicianFinalStatus || decisionStatus)}
              >
                {caseData.clinicianFinalStatus || decisionStatus}
              </Badge>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Model Summary
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Overall Confidence: {formatPercent(caseData.overallConfidenceScore)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Uncertainty: {getUncertaintyLabel(caseData)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Type: {caseData.urticariaType || "—"}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Recommendation: {caseData.recommendations || "—"}
                  </p>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Assessment Scores</p>
                  <div className="mt-2 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>UCT Total</span>
                      <span className="font-semibold text-slate-900">
                        {caseData.uct?.totalScore ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AECT Total</span>
                      <span className="font-semibold text-slate-900">
                        {caseData.aect?.totalScore ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <p className="text-sm text-slate-500">Risk Flags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {caseData.risks?.length ? (
                    caseData.risks.map((risk) => (
                      <Badge key={risk.riskType} color={getRiskColor(risk.riskLevel)}>
                        {risk.riskType.replaceAll("_", " ")} ({Math.round(risk.riskScore * 100)}%)
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No risks reported.</span>
                  )}
                </div>
                <p className="mt-4 text-sm text-slate-500">SHAP Scores</p>
                <div className="mt-3 space-y-3">
                  {caseData.shapScores?.length ? (
                    caseData.shapScores.map((item) => (
                      <div
                        key={item.feature}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {item.feature}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatPercent(item.contribution)}
                          </span>
                        </div>
                        <Progress
                          progress={Math.round((item.contribution || 0) * 100)}
                          color="cyan"
                          size="sm"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                      No SHAP scores available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Clinical Image</p>
                {caseData.images ? (
                  <img
                    src={caseData.images}
                    alt="Clinical"
                    className="mt-3 w-full rounded-lg object-cover"
                  />
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No image available.</p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Grad-CAM Heatmap</p>
                {caseData.gradCamHeatMapImage ? (
                  <img
                    src={caseData.gradCamHeatMapImage}
                    alt="Grad-CAM heatmap"
                    className="mt-3 w-full rounded-lg object-cover"
                  />
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No heatmap available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-lg shadow-emerald-100/40">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-200/70 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Clinician Feedback Panel
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Clinician Feedback
              </h2>
            </div>
            <div className="relative mt-4 grid gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Feedback Action
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  color={selectedAction === "Accepted" ? "success" : "gray"}
                  onClick={() => setSelectedAction("Accepted")}
                  disabled={isSubmitting}
                  className={
                    selectedAction === "Accepted"
                      ? "shadow-md shadow-emerald-200/60"
                      : "bg-white text-emerald-600 hover:bg-emerald-50"
                  }
                >
                  Accept
                </Button>
                <Button
                  color={selectedAction === "Corrected" ? "warning" : "gray"}
                  onClick={() => setSelectedAction("Corrected")}
                  disabled={isSubmitting}
                  className={
                    selectedAction === "Corrected"
                      ? "shadow-md shadow-amber-200/70"
                      : "bg-white text-amber-600 hover:bg-amber-50"
                  }
                >
                  Correct
                </Button>
                <Button
                  color={selectedAction === "Rejected" ? "failure" : "gray"}
                  onClick={() => setSelectedAction("Rejected")}
                  disabled={isSubmitting}
                  className={
                    selectedAction === "Rejected"
                      ? "shadow-md shadow-rose-200/70"
                      : "bg-white text-rose-600 hover:bg-rose-50"
                  }
                >
                  Reject
                </Button>
              </div>
              {selectedAction === "Corrected" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 p-2">
                        Corrected Step
                      </p>
                      <Dropdown
                        value={selectedStep}
                        onChange={setSelectedStep}
                        placeholder="Select treatment stage"
                        options={TREATMENT_STEPS}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 p-2">
                        Corrected Drugs
                      </p>
                      <Dropdown
                        value={selectedDrug}
                        onChange={setSelectedDrug}
                        placeholder="Select predicted drug class"
                        options={DRUG_OPTIONS}
                      />
                    </div>
                  </div>
                  {isOtherDrugSelected() && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 p-2">
                        Other Drugs
                      </p>
                      <TextInput
                        placeholder="Enter other drug"
                        value={otherDrugText}
                        onChange={(event) => setOtherDrugText(event.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 p-1">
                Feedback Comment
              </p>
              <Textarea
                rows={3}
                placeholder="Clinician comment (optional)."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-rose-600">{errorMessage}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  color="info"
                  onClick={handleDecision}
                  disabled={isSubmitting}
                  className="shadow-md shadow-sky-200/70"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Patient Metadata</p>
              <h3 className="text-lg font-semibold text-slate-900">
                {caseData.caseId}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Hospital</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.hospital || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visit Date</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(caseData.visitDate || caseData.date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Patient</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.patientAge ?? caseData.age ?? "—"} / {caseData.patientGender ?? caseData.sex ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Symptoms</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.symptoms || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Urticaria Type</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.urticariaType || caseData.predictedLabel || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Model Snapshot</p>
              <div className="mt-3 space-y-4 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Treatment Model
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Predicted Drug</span>
                      <span className="font-semibold text-slate-900">
                        {caseData.predictedDrug || caseData.predictedLabel || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Predicted Step</span>
                      <span className="font-semibold text-slate-900">
                        {caseData.predictedStep || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Drug Confidence</span>
                      <span className="font-semibold text-slate-900">
                        {formatPercent(caseData.confidencePredictedDrugStep)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Risk Model
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Overall Confidence</span>
                      <span className="font-semibold text-slate-900">
                        {formatPercent(caseData.overallConfidenceScore)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uncertainty</span>
                      <span className="font-semibold text-slate-900">
                        {getUncertaintyLabel(caseData)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Type</span>
                      <span className="font-semibold text-slate-900">
                        {caseData.urticariaType || "—"}
                      </span>
                    </div>
                    <Progress
                      progress={getConfidencePercent(caseData) ?? 0}
                      color={getUncertaintyLabel(caseData) === "High" ? "warning" : "teal"}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge color={caseData.gradCamAvailable ? "success" : "gray"}>
                    Grad-CAM {caseData.gradCamAvailable ? "Available" : "Missing"}
                  </Badge>
                  <Badge color={caseData.shapAvailable ? "success" : "gray"}>
                    SHAP {caseData.shapAvailable ? "Available" : "Missing"}
                  </Badge>
                </div>
              </div>
            </div>

            <ActiveLearningStepsSidebar
              isFlagged={decisionStatus === "NEED_REVIEW"}
              hasFeedback={feedbackEntries.length > 0}
              caseStatus={caseData.clinicianFinalStatus || caseData.status}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ReviewCaseDetailPage;
