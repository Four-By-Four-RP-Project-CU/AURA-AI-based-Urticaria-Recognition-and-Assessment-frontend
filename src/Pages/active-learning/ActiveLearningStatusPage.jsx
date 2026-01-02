import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Progress, Spinner } from "flowbite-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import StatCard from "../../components/active-learning/StatCard";
import { bumpModelVersion } from "../../utils/activeLearningUtils";
import { triggerRetrain } from "../../services/modelsApi";

const FEEDBACK_KEY = "activeLearningFeedback";
const OVERRIDES_KEY = "activeLearningCaseOverrides";
const DATASET_MIN_RECORDS = 50;
const DATASET_MAX_RECORDS = 80;

const ActiveLearningStatusPage = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [caseOverrides, setCaseOverrides] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSimulationProgress, setRetrainSimulationProgress] = useState(0);
  const [retrainMessage, setRetrainMessage] = useState("");
  const [retrainError, setRetrainError] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(FEEDBACK_KEY) || "[]"
      );
      setFeedbackEntries(Array.isArray(stored) ? stored : []);
    } catch (error) {
      setFeedbackEntries([]);
    }

    try {
      const overrides = JSON.parse(
        window.localStorage.getItem(OVERRIDES_KEY) || "{}"
      );
      setCaseOverrides(
        overrides && typeof overrides === "object" ? overrides : {}
      );
    } catch (error) {
      setCaseOverrides({});
    }
  }, []);

  const mergedCases = useMemo(
    () =>
      mockActiveLearningCases.map((item) => ({
        ...item,
        ...caseOverrides[item.caseId],
      })),
    [caseOverrides]
  );
  const reviewedCaseIds = useMemo(
    () => new Set(feedbackEntries.map((entry) => entry.caseId)),
    [feedbackEntries]
  );

  const reviewedCount = feedbackEntries.length;
  const correctedCount = feedbackEntries.filter(
    (entry) => entry.clinicianAction === "Corrected"
  ).length;
  const acceptedCount = feedbackEntries.filter(
    (entry) => entry.clinicianAction === "Accepted"
  ).length;
  const rejectedCount = feedbackEntries.filter(
    (entry) => entry.clinicianAction === "Rejected"
  ).length;

  const datasetTarget = Math.min(
    Math.max(mockActiveLearningCases.length, DATASET_MIN_RECORDS),
    DATASET_MAX_RECORDS
  );
  const coverageRate = Math.min(
    Math.round((reviewedCount / datasetTarget) * 100),
    100
  );
  const readinessStatus =
    reviewedCount >= DATASET_MAX_RECORDS
      ? {
          label: "Dataset full",
          description: "Full dataset reached. Ready for final retraining.",
          className: "border-emerald-200 bg-emerald-50 text-emerald-800",
          progressColor: "success",
        }
      : reviewedCount >= DATASET_MIN_RECORDS
        ? {
            label: "Minimum met",
            description: "Minimum 50 reviews met. Ready for retraining.",
            className: "border-amber-200 bg-amber-50 text-amber-800",
            progressColor: "warning",
          }
        : {
            label: "Needs more reviews",
            description: `Collect at least ${DATASET_MIN_RECORDS} reviewed cases.`,
            className: "border-rose-200 bg-rose-50 text-rose-800",
            progressColor: "failure",
          };
  const readinessCardClass =
    coverageRate >= 80
      ? "border-emerald-200 bg-emerald-50"
      : coverageRate >= 50
        ? "border-sky-200 bg-sky-50"
        : "border-rose-200 bg-rose-50";

  const retrainedCases = mergedCases.filter(
    (item) => item.status === "RETRAINED"
  );
  const retrainCount = retrainedCases.length;
  const latestModelVersion = retrainCount
    ? retrainedCases[0].modelVersion
    : mockActiveLearningCases[0].modelVersion;
  const latestConfidence = retrainCount
    ? retrainedCases[0].confidence
    : mockActiveLearningCases[0].confidence;
  const modelAccuracy = Math.min(99, Math.round((latestConfidence + 30) * 10) / 10);
  const modelMacroF1 = Math.min(99, Math.round((latestConfidence + 24) * 10) / 10);
  const retrainProgress = Math.min(
    Math.round((retrainCount / mockActiveLearningCases.length) * 100),
    100
  );
  const canRetrain = reviewedCount >= DATASET_MIN_RECORDS;
  const deploymentStatus = {
    label: "Live",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
  };

  const lastUpdated = useMemo(() => {
    if (feedbackEntries.length === 0) return "No updates yet";
    const latest = feedbackEntries[0];
    return new Date(latest.timestamp).toLocaleString();
  }, [feedbackEntries]);

  const handleRetrainComplete = (nextVersion, nextConfidence) => {
    if (reviewedCaseIds.size === 0) return;
    try {
      const overrides = JSON.parse(
        window.localStorage.getItem(OVERRIDES_KEY) || "{}"
      );
      const next = { ...overrides };
      reviewedCaseIds.forEach((caseId) => {
        next[caseId] = {
          ...(next[caseId] || {}),
          modelVersion: nextVersion,
          confidence: nextConfidence,
          status: "RETRAINED",
        };
      });
      window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
      setCaseOverrides(next);
    } catch (error) {
      setCaseOverrides((prev) => prev);
    }
  };

  const handleRetrain = () => {
    if (!canRetrain || isRetraining) return;
    setIsRetraining(true);
    setRetrainError("");
    setRetrainMessage("");

    const startRetrain = async () => {
      try {
        const response = await triggerRetrain();
        setRetrainMessage(
          `Retraining started for ${response.candidateModelVersion}`
        );
        setRetrainSimulationProgress(10);

        let value = 10;
        const timer = setInterval(() => {
          value += 15;
          setRetrainSimulationProgress(Math.min(value, 100));

          if (value >= 100) {
            clearInterval(timer);
            const nextVersion = bumpModelVersion(latestModelVersion);
            const nextConfidence = Math.min(latestConfidence + 4, 99);
            setIsRetraining(false);
            handleRetrainComplete(nextVersion, nextConfidence);
          }
        }, 320);
      } catch (error) {
        setIsRetraining(false);
        setRetrainError(
          error instanceof Error ? error.message : "Failed to start retraining."
        );
      }
    };

    startRetrain();
  };

  const header = (
    <PageHeader
      eyebrow="Active Learning"
      title="Dataset & Redeployment Status"
      subtitle="Combined overview of clinician-labeled dataset updates and model redeployment readiness."
      actions={
        <Button
          color="gray"
          pill
          onClick={() => setShowSidebar((prev) => !prev)}
          aria-label={showSidebar ? "Hide navigation" : "Show navigation"}
        >
          {showSidebar ? <FaTimes /> : <FaBars />}
        </Button>
      }
    />
  );

  return (
    <DashboardShell
      header={header}
      sidebar={showSidebar ? <ActiveLearningSidebar /> : null}
    >
      <div className="space-y-6">
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Updated Dataset Indicator" title="Clinician Label Coverage">
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Reviewed Cases</span>
                <span className="font-semibold text-slate-900">
                  {reviewedCount} / {datasetTarget}
                </span>
              </div>
              <Progress
                progress={coverageRate}
                color={readinessStatus.progressColor}
                size="sm"
              />
              <div className="flex flex-wrap gap-2">
                <Badge color="info">Accepted {acceptedCount}</Badge>
                <Badge color="warning">Corrected {correctedCount}</Badge>
                <Badge color="failure">Rejected {rejectedCount}</Badge>
              </div>
              <div
                className={`rounded-lg border p-3 text-sm ${readinessStatus.className}`}
              >
                {readinessStatus.label}: {readinessStatus.description}
              </div>
              <p className="text-xs text-slate-500">Last update: {lastUpdated}</p>
            </div>
          </StatCard>

          <StatCard
            label="Dataset Readiness"
            title="Quality Signals"
            className={readinessCardClass}
          >
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div
                className={`rounded-lg border p-3 text-xs ${readinessStatus.className}`}
              >
                {readinessStatus.label}. Target range {DATASET_MIN_RECORDS}-
                {DATASET_MAX_RECORDS} reviewed cases.
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Coverage Rate</span>
                <span className="font-semibold text-slate-900">
                  {coverageRate}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Corrections Logged</span>
                <span className="font-semibold text-slate-900">
                  {correctedCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Accepted Predictions</span>
                <span className="font-semibold text-slate-900">
                  {acceptedCount}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                Use this summary to align dataset readiness during clinical demos.
              </div>
            </div>
          </StatCard>

          <StatCard label="Redeployment Status" title="Updated Model Release">
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Current model version</span>
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <span
                    className={`h-2.5 w-2.5 animate-pulse rounded-full ${deploymentStatus.dotClass}`}
                    aria-hidden="true"
                  />
                  <span>{latestModelVersion}</span>
                  <span className={`text-xs font-medium ${deploymentStatus.textClass}`}>
                    {deploymentStatus.label}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Accuracy level</span>
                <span className="font-semibold text-slate-900">
                  {modelAccuracy}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Macro F1 score</span>
                <span className="font-semibold text-slate-900">
                  {modelMacroF1}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color="success">Updated model deployed</Badge>
                <Badge color="info">Active Learning Enabled</Badge>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Redeployment status: Live and monitoring uncertain cases.
              </div>
            </div>
          </StatCard>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <StatCard label="Retraining Coverage" title="Eligible Cases Processed">
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Cases retrained</span>
                  <span className="font-semibold text-slate-900">
                    {retrainCount} / {mockActiveLearningCases.length}
                  </span>
                </div>
                <Progress progress={retrainProgress} color="info" size="sm" />
                <p className="text-xs text-slate-500">
                  Retraining progress is simulated based on cases marked RETRAINED in
                  the review workflow.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">Retraining Simulation</p>
                <p className="mt-1 text-sm text-slate-600">
                  Uses reviewed cases to mock a new model build.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    color="info"
                    disabled={!canRetrain || isRetraining}
                    onClick={handleRetrain}
                  >
                    {isRetraining ? "Retraining..." : "Trigger Retraining"}
                  </Button>
                  {!canRetrain && (
                    <Badge color="warning">
                      Needs {DATASET_MIN_RECORDS}+ reviews
                    </Badge>
                  )}
                  {isRetraining && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Spinner size="sm" />
                      Updating weights
                    </div>
                  )}
                </div>
                {retrainMessage && (
                  <p className="mt-2 text-xs text-emerald-700">
                    {retrainMessage}
                  </p>
                )}
                {retrainError && (
                  <p className="mt-2 text-xs text-rose-600">{retrainError}</p>
                )}
                <div className="mt-4">
                  <Progress
                    progress={retrainSimulationProgress}
                    color="info"
                    size="sm"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Current model {latestModelVersion} • Confidence target{" "}
                    {latestConfidence}%
                  </p>
                </div>
              </div>
            </div>
          </StatCard>

          <StatCard label="Clinician Review" title="Recent Activity">
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Reviewed this cycle</span>
                <span className="font-semibold text-slate-900">
                  {reviewedCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Accepted vs corrected</span>
                <span className="font-semibold text-slate-900">
                  {acceptedCount} / {correctedCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Rejected predictions</span>
                <span className="font-semibold text-slate-900">
                  {rejectedCount}
                </span>
              </div>
              <p className="text-xs text-slate-500">Last update: {lastUpdated}</p>
            </div>
          </StatCard>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ActiveLearningStatusPage;
