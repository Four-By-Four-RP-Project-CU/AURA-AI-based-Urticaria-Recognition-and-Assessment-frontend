import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Progress } from "flowbite-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import StatCard from "../../components/active-learning/StatCard";

const OVERRIDES_KEY = "activeLearningCaseOverrides";

const RedeploymentStatusPage = () => {
  const [caseOverrides, setCaseOverrides] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    try {
      const overrides = JSON.parse(
        window.localStorage.getItem(OVERRIDES_KEY) || "{}"
      );
      setCaseOverrides(overrides && typeof overrides === "object" ? overrides : {});
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

  const header = (
    <PageHeader
      eyebrow="Active Learning"
      title="Redeployment Status"
      subtitle="Mock redeployment lifecycle after simulated retraining."
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
        <StatCard label="Deployment Summary" title="Updated Model Release">
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
      </div>
    </DashboardShell>
  );
};

export default RedeploymentStatusPage;
