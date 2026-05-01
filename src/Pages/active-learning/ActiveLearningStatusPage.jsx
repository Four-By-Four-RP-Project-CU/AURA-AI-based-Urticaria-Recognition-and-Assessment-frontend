import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Progress, Spinner } from "flowbite-react";
import { FaBars, FaTimes } from "react-icons/fa";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import StatCard from "../../components/active-learning/StatCard";
import {
  getDashboardInsights,
  getRedeploymentStatusInsights,
  triggerRetrain,
} from "../../services/modelsApi";

const DEFAULT_INSIGHTS = {
  retrainingCoverage: {
    retrainedCases: 0,
    targetCases: 0,
    progressPercent: 0,
    eligibleReviewedCases: 0,
    currentModelVersion: "—",
    confidenceTargetPercent: 0,
    lastUpdatedAt: "",
  },
  datasetReadiness: {
    reviewedCases: 0,
    totalCases: 0,
    coverageRatePercent: 0,
    correctionsLogged: 0,
    acceptedPredictions: 0,
    targetRangeStart: 0,
    targetRangeEnd: 0,
    minimumMet: false,
    lastUpdatedAt: "",
  },
  recentActivity: {
    reviewedThisCycle: 0,
    acceptedCount: 0,
    correctedCount: 0,
    rejectedCount: 0,
    lastUpdatedAt: "",
  },
  labelCoverage: {
    reviewedCases: 0,
    targetReviewedCases: 0,
    acceptedCount: 0,
    correctedCount: 0,
    rejectedCount: 0,
    readyForRetraining: false,
    lastUpdatedAt: "",
  },
};

const DEFAULT_REDEPLOYMENT = {
  currentModelVersion: "—",
  isLive: false,
  eligibleReviewedCases: 0,
  confidenceTargetPercent: 0,
  updatedModelDeployed: false,
  activeLearningEnabled: false,
  redeploymentStatusMessage: "No redeployment status available.",
  lastUpdatedAt: "",
};

const formatLastUpdated = (timestamp) => {
  if (!timestamp) return "No updates yet";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "No updates yet";
  return date.toLocaleString();
};

const ActiveLearningStatusPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [insights, setInsights] = useState(null);
  const [redeployment, setRedeployment] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainMessage, setRetrainMessage] = useState("");
  const [retrainError, setRetrainError] = useState("");

  const loadInsights = useCallback(async (signal) => {
    setIsLoadingInsights(true);
    setInsightsError("");

    try {
      const [insightsResponse, redeploymentResponse] = await Promise.allSettled([
        getDashboardInsights(signal),
        getRedeploymentStatusInsights(signal),
      ]);

      if (insightsResponse.status === "fulfilled") {
        setInsights(insightsResponse.value);
      } else {
        setInsights(null);
      }

      if (redeploymentResponse.status === "fulfilled") {
        setRedeployment(redeploymentResponse.value);
      } else {
        setRedeployment(null);
      }

      if (
        insightsResponse.status === "rejected" &&
        redeploymentResponse.status === "rejected"
      ) {
        throw insightsResponse.reason || redeploymentResponse.reason;
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setInsightsError(error?.message || "Failed to load dashboard insights.");
        setInsights(null);
        setRedeployment(null);
      }
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadInsights(controller.signal);
    return () => controller.abort();
  }, [loadInsights]);

  const data = insights || DEFAULT_INSIGHTS;
  const retrainingCoverage = data.retrainingCoverage;
  const datasetReadiness = data.datasetReadiness;
  const recentActivity = data.recentActivity;
  const labelCoverage = data.labelCoverage;
  const redeploymentStatus = redeployment || {
    ...DEFAULT_REDEPLOYMENT,
    currentModelVersion: retrainingCoverage.currentModelVersion || "—",
    eligibleReviewedCases: retrainingCoverage.eligibleReviewedCases || 0,
    confidenceTargetPercent: retrainingCoverage.confidenceTargetPercent || 0,
    isLive: true,
    activeLearningEnabled: true,
    updatedModelDeployed: true,
    redeploymentStatusMessage:
      "Redeployment status: Live and monitoring uncertain cases.",
    lastUpdatedAt: retrainingCoverage.lastUpdatedAt || "",
  };

  const reviewedCount = labelCoverage.reviewedCases;
  const acceptedCount = labelCoverage.acceptedCount;
  const correctedCount = labelCoverage.correctedCount;
  const rejectedCount = labelCoverage.rejectedCount;
  const datasetTarget = labelCoverage.targetReviewedCases || datasetReadiness.totalCases;
  const coverageRate = Math.max(
    0,
    Math.min(100, Math.round(datasetReadiness.coverageRatePercent || 0))
  );

  const readinessStatus =
    datasetReadiness.targetRangeEnd > 0 &&
    reviewedCount >= datasetReadiness.targetRangeEnd
      ? {
          label: "Dataset full",
          description: "Full dataset reached. Ready for final retraining.",
          className: "border-emerald-200 bg-emerald-50 text-emerald-800",
          progressColor: "success",
        }
      : datasetReadiness.minimumMet
        ? {
            label: "Minimum met",
            description: `Minimum ${datasetReadiness.targetRangeStart} reviews met. Ready for retraining.`,
            className: "border-amber-200 bg-amber-50 text-amber-800",
            progressColor: "warning",
          }
        : {
            label: "Needs more reviews",
            description: `Collect at least ${datasetReadiness.targetRangeStart} reviewed cases.`,
            className: "border-rose-200 bg-rose-50 text-rose-800",
            progressColor: "failure",
          };

  const readinessCardClass =
    coverageRate >= 80
      ? "border-emerald-200 bg-emerald-50"
      : coverageRate >= 50
        ? "border-sky-200 bg-sky-50"
        : "border-rose-200 bg-rose-50";

  const retrainCount = retrainingCoverage.retrainedCases;
  const retrainTarget = retrainingCoverage.targetCases;
  const retrainProgress = Math.max(
    0,
    Math.min(100, Math.round(retrainingCoverage.progressPercent || 0))
  );
  const canRetrain =
    labelCoverage.readyForRetraining || datasetReadiness.minimumMet;

  const deploymentStatus = redeploymentStatus.isLive
    ? {
        label: "Live",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-700",
      }
    : {
        label: "Not Live",
        dotClass: "bg-rose-500",
        textClass: "text-rose-700",
      };

  const lastUpdated = useMemo(
    () =>
      formatLastUpdated(
        labelCoverage.lastUpdatedAt ||
          recentActivity.lastUpdatedAt ||
          datasetReadiness.lastUpdatedAt ||
          retrainingCoverage.lastUpdatedAt
      ),
    [
      labelCoverage.lastUpdatedAt,
      recentActivity.lastUpdatedAt,
      datasetReadiness.lastUpdatedAt,
      retrainingCoverage.lastUpdatedAt,
    ]
  );

  const handleRetrain = async () => {
    if (!canRetrain || isRetraining) return;
    setIsRetraining(true);
    setRetrainError("");
    setRetrainMessage("");

    try {
      const response = await triggerRetrain();
      setRetrainMessage(
        `Retraining started for ${response.candidateModelVersion}`
      );
      await loadInsights();
    } catch (error) {
      setRetrainError(
        error instanceof Error ? error.message : "Failed to start retraining."
      );
    } finally {
      setIsRetraining(false);
    }
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
        {insightsError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {insightsError}
          </div>
        )}
        {isLoadingInsights && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading status overview...
          </div>
        )}

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
                {readinessStatus.label}. Target range {datasetReadiness.targetRangeStart}-
                {datasetReadiness.targetRangeEnd} reviewed cases.
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
                  {datasetReadiness.correctionsLogged}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Accepted Predictions</span>
                <span className="font-semibold text-slate-900">
                  {datasetReadiness.acceptedPredictions}
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
                  <span>{redeploymentStatus.currentModelVersion || "—"}</span>
                  <span className={`text-xs font-medium ${deploymentStatus.textClass}`}>
                    {deploymentStatus.label}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Eligible reviewed cases</span>
                <span className="font-semibold text-slate-900">
                  {redeploymentStatus.eligibleReviewedCases}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence target</span>
                <span className="font-semibold text-slate-900">
                  {redeploymentStatus.confidenceTargetPercent}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color={redeploymentStatus.updatedModelDeployed ? "success" : "gray"}>
                  {redeploymentStatus.updatedModelDeployed
                    ? "Updated model deployed"
                    : "Updated model pending"}
                </Badge>
                <Badge color={redeploymentStatus.activeLearningEnabled ? "info" : "gray"}>
                  {redeploymentStatus.activeLearningEnabled
                    ? "Active Learning Enabled"
                    : "Active Learning Disabled"}
                </Badge>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {redeploymentStatus.redeploymentStatusMessage}
              </div>
              <p className="text-xs text-slate-500">
                Last update: {formatLastUpdated(redeploymentStatus.lastUpdatedAt)}
              </p>
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
                    {retrainCount} / {retrainTarget}
                  </span>
                </div>
                <Progress progress={retrainProgress} color="info" size="sm" />
                <p className="text-xs text-slate-500">
                  Progress is read from dashboard insights retraining coverage.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">Retraining</p>
                <p className="mt-1 text-sm text-slate-600">
                  Start model retraining from reviewed cases.
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
                      Needs {datasetReadiness.targetRangeStart}+ reviews
                    </Badge>
                  )}
                  {isRetraining && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Spinner size="sm" />
                      Submitting retrain request
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
                  <Progress progress={retrainProgress} color="info" size="sm" />
                  <p className="mt-2 text-xs text-slate-500">
                    Current model {retrainingCoverage.currentModelVersion || "—"} • Confidence target{" "}
                    {retrainingCoverage.confidenceTargetPercent}%
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
                  {recentActivity.reviewedThisCycle}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Accepted vs corrected</span>
                <span className="font-semibold text-slate-900">
                  {recentActivity.acceptedCount} / {recentActivity.correctedCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Rejected predictions</span>
                <span className="font-semibold text-slate-900">
                  {recentActivity.rejectedCount}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Last update: {formatLastUpdated(recentActivity.lastUpdatedAt)}
              </p>
            </div>
          </StatCard>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ActiveLearningStatusPage;
