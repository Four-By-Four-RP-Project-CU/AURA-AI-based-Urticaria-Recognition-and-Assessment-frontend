import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Progress } from "flowbite-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import StatCard from "../../components/active-learning/StatCard";

const FEEDBACK_KEY = "activeLearningFeedback";

const DatasetStatusPage = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
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
  }, []);

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

  const lastUpdated = useMemo(() => {
    if (feedbackEntries.length === 0) return "No updates yet";
    const latest = feedbackEntries[0];
    return new Date(latest.timestamp).toLocaleString();
  }, [feedbackEntries]);

  const coverageRate = Math.round(
    (reviewedCount / mockActiveLearningCases.length) * 100
  );

  const header = (
    <PageHeader
      eyebrow="Active Learning"
      title="Updated Dataset Indicator"
      subtitle="Tracks clinician-reviewed labels and dataset readiness for retraining."
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
      <div className="grid items-stretch gap-6 md:grid-cols-2">
        <StatCard label="Dataset Summary" title="Clinician Label Coverage">
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

        <StatCard label="Quality Signals" title="Dataset Readiness">
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
              Use this summary to explain dataset updates during evaluation demos
              and PP sessions.
            </div>
          </div>
        </StatCard>
      </div>
    </DashboardShell>
  );
};

export default DatasetStatusPage;
