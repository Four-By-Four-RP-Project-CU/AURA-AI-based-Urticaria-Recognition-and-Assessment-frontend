import React from "react";
import { Badge } from "flowbite-react";

const ActiveLearningStepsSidebar = ({
  isFlagged,
  hasFeedback,
  caseStatus,
}) => {
  const steps = [
    {
      id: "flagged",
      label: "Flagged by uncertainty",
      complete: isFlagged,
    },
    {
      id: "opened",
      label: "Clinician review opened",
      complete: true,
    },
    {
      id: "decision",
      label: "Decision submitted",
      complete: hasFeedback,
    },
    {
      id: "dataset",
      label: "Added to feedback dataset",
      complete: hasFeedback,
    },
    {
      id: "retrain",
      label: "Eligible for retraining",
      complete: caseStatus === "REVIEWED" || caseStatus === "RETRAINED",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">Active Learning Steps</p>
      <h3 className="text-lg font-semibold text-slate-900">Review Progress</h3>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                  step.complete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && <div className="h-6 w-px bg-slate-200" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">{step.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Case Status
        </span>
        <Badge color={caseStatus === "RETRAINED" ? "success" : "info"}>
          {caseStatus}
        </Badge>
      </div>
    </div>
  );
};

export default ActiveLearningStepsSidebar;
