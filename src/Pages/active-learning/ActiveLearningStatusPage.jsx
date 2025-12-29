import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Progress } from "flowbite-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import StatCard from "../../components/active-learning/StatCard";

const FEEDBACK_KEY = "activeLearningFeedback";
const OVERRIDES_KEY = "activeLearningCaseOverrides";

const ActiveLearningStatusPage = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [caseOverrides, setCaseOverrides] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);

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

  const coverageRate = Math.round(
    (reviewedCount / mockActiveLearningCases.length) * 100
  );

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
  const retrainProgress = Math.min(
    Math.round((retrainCount / mockActiveLearningCases.length) * 100),
    100
  );

  const lastUpdated = useMemo(() => {
    if (feedbackEntries.length === 0) return "No updates yet";
    const latest = feedbackEntries[0];
    return new Date(latest.timestamp).toLocaleString();
  }, [feedbackEntries]);

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
                  {reviewedCount} / {mockActiveLearningCases.length}
                </span>
              </div>
              <Progress progress={coverageRate} color="info" size="sm" />
              <div className="flex flex-wrap gap-2">
                <Badge color="info">Accepted {acceptedCount}</Badge>
                <Badge color="warning">Corrected {correctedCount}</Badge>
                <Badge color="failure">Rejected {rejectedCount}</Badge>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {reviewedCount > 0
                  ? "Dataset status: Updated with clinician labels."
                  : "Dataset status: Awaiting clinician feedback."}
              </div>
              <p className="text-xs text-slate-500">Last update: {lastUpdated}</p>
            </div>
          </StatCard>

          <StatCard label="Dataset Readiness" title="Quality Signals">
            <div className="mt-4 space-y-3 text-sm text-slate-600">
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
                <span className="font-semibold text-slate-900">
                  {latestModelVersion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence target</span>
                <span className="font-semibold text-slate-900">
                  {latestConfidence}%
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
            <div className="mt-4 space-y-3">
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
