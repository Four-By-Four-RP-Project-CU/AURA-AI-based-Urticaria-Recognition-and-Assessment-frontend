import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Progress,
  Textarea,
} from "flowbite-react";
import { FaArrowLeft, FaChartBar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import { getUncertaintyLevel } from "../../utils/activeLearningUtils";
import ActiveLearningStepsSidebar from "../../components/active-learning/ActiveLearningStepsSidebar";
import RetrainingSimulationPanel from "../../components/active-learning/RetrainingSimulationPanel";
import DashboardShell from "../../components/active-learning/DashboardShell";
import Dropdown from "../../components/active-learning/Dropdown";

const FEEDBACK_KEY = "activeLearningFeedback";
const OVERRIDES_KEY = "activeLearningCaseOverrides";

const ReviewCaseDetailPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [correctedLabel, setCorrectedLabel] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const baseCase = mockActiveLearningCases.find(
      (item) => item.caseId === caseId
    );
    if (!baseCase) return;
    const overrides = JSON.parse(
      window.localStorage.getItem(OVERRIDES_KEY) || "{}"
    );
    const merged = { ...baseCase, ...overrides[caseId] };
    setCaseData(merged);

    const storedFeedback = JSON.parse(
      window.localStorage.getItem(FEEDBACK_KEY) || "[]"
    );
    setFeedbackEntries(storedFeedback.filter((entry) => entry.caseId === caseId));
  }, [caseId]);

  const reviewerName = "Dr. Perera";

  const decisionStatus = useMemo(() => {
    if (!caseData) return "NEEDS_REVIEW";
    if (caseData.confidence < caseData.threshold) return "NEEDS_REVIEW";
    return "AUTO_ACCEPTED";
  }, [caseData]);

  const decisionRule =
    "Flag predictions with confidence below the clinician review threshold.";

  const decisionReason = caseData
    ? `Top prediction confidence is ${caseData.confidence}%, which is ${
        caseData.confidence < caseData.threshold ? "below" : "above"
      } the ${caseData.threshold}% threshold.`
    : "";

  const correctedOptions = caseData ? caseData.topK.map((item) => item.label) : [];

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

  const handleDecision = (action) => {
    if (action === "Corrected" && !correctedLabel) {
      setErrorMessage("Select a corrected label before submitting.");
      return;
    }

    const entry = {
      caseId,
      originalPrediction: caseData.predictedLabel,
      clinicianAction: action,
      correctedLabel: action === "Corrected" ? correctedLabel : "N/A",
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
    setCorrectedLabel("");
    setComment("");
    setErrorMessage("");
    toast.success("Clinician decision saved.");
  };

  const handleRetrainComplete = (nextVersion, nextConfidence) => {
    updateOverrides({
      modelVersion: nextVersion,
      confidence: nextConfidence,
      status: "RETRAINED",
    });
    toast.info("Retraining simulated and model updated.");
  };

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
            Case not found. Return to the review queue.
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
          <Badge color={caseData.status === "RETRAINED" ? "success" : "info"}>
            {caseData.status}
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
              {caseData.hospital}
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
                <p className="text-sm text-slate-700">{caseData.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Patient
                </p>
                <p className="text-sm text-slate-700">
                  {caseData.age} / {caseData.sex}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Symptoms
                </p>
                <p className="text-sm text-slate-700">{caseData.symptoms}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Prediction & Confidence</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {caseData.predictedLabel}
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Confidence</span>
                <span className="font-semibold text-slate-900">
                  {caseData.confidence}%
                </span>
              </div>
              <Progress
                progress={caseData.confidence}
                color={caseData.confidence >= caseData.threshold ? "teal" : "warning"}
                size="sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Uncertainty</p>
                <Badge
                  color={
                    getUncertaintyLevel(caseData.confidence) === "High"
                      ? "failure"
                      : "warning"
                  }
                >
                  {getUncertaintyLevel(caseData.confidence)}
                </Badge>
              </div>
              {caseData.confidence < caseData.threshold && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Confidence below {caseData.threshold}% threshold. Requires
                  clinician review.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  Pre-trained Model Decision
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Explainability
                </h2>
                <p className="text-sm text-slate-600">
                  {caseData.modelName} {caseData.modelVersion} •{" "}
                  {new Date(caseData.runAt).toLocaleString()}
                </p>
              </div>
              <Badge
                color={
                  decisionStatus === "AUTO_ACCEPTED"
                    ? "success"
                    : decisionStatus === "NEEDS_REVIEW"
                    ? "warning"
                    : "failure"
                }
              >
                {decisionStatus}
              </Badge>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Decision Rule
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{decisionRule}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    Reason: {decisionReason}
                  </p>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Threshold</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                    <span>Confidence Threshold</span>
                    <span className="font-semibold text-slate-900">
                      {caseData.threshold}%
                    </span>
                  </div>
                  <Progress
                    progress={caseData.confidence}
                    color={caseData.confidence >= caseData.threshold ? "teal" : "warning"}
                    size="sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <p className="text-sm text-slate-500">Top-K Predictions</p>
                <div className="mt-3 space-y-3">
                  {caseData.topK.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {item.probability}%
                        </span>
                      </div>
                      <Progress progress={item.probability} color="info" size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Clinician Feedback Panel</p>
            <h2 className="text-xl font-semibold text-slate-900">
              Clinician Feedback
            </h2>
            <div className="mt-4 grid gap-4">
              <div>
                <Dropdown
                  value={correctedLabel}
                  onChange={setCorrectedLabel}
                  placeholder="Select corrected label (if needed)"
                  options={correctedOptions.map((label) => ({
                    value: label,
                    label,
                  }))}
                />
              </div>
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
                <Button color="success" onClick={() => handleDecision("Accepted")}>
                  Accept
                </Button>
                <Button color="warning" onClick={() => handleDecision("Corrected")}>
                  Correct
                </Button>
                <Button color="failure" onClick={() => handleDecision("Rejected")}>
                  Reject
                </Button>
              </div>
            </div>
          </div>

          <RetrainingSimulationPanel
            canRetrain={reviewedCount > 0}
            currentVersion={caseData.modelVersion}
            currentConfidence={caseData.confidence}
            onComplete={handleRetrainComplete}
          />
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
                    {caseData.hospital}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visit Date</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.date}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Patient</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.age} / {caseData.sex}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Symptoms</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.symptoms}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Confidence Snapshot</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Model</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.modelVersion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confidence</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.confidence}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Threshold</span>
                  <span className="font-semibold text-slate-900">
                    {caseData.threshold}%
                  </span>
                </div>
                <Progress
                  progress={caseData.confidence}
                  color={caseData.confidence >= caseData.threshold ? "teal" : "warning"}
                  size="sm"
                />
              </div>
            </div>

            <ActiveLearningStepsSidebar
              isFlagged={caseData.confidence < caseData.threshold}
              hasFeedback={feedbackEntries.length > 0}
              caseStatus={caseData.status}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ReviewCaseDetailPage;
