import React, { useState } from "react";
import { Badge, Button, Progress, Spinner } from "flowbite-react";
import { bumpModelVersion } from "../../utils/activeLearningUtils";

const RetrainingSimulationPanel = ({
  canRetrain,
  currentVersion,
  currentConfidence,
  onComplete,
}) => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRetrain = () => {
    if (!canRetrain || isRetraining) return;
    setIsRetraining(true);
    setProgress(10);

    let value = 10;
    const timer = setInterval(() => {
      value += 15;
      setProgress(Math.min(value, 100));

      if (value >= 100) {
        clearInterval(timer);
        const nextVersion = bumpModelVersion(currentVersion);
        const nextConfidence = Math.min(currentConfidence + 4, 99);
        setIsRetraining(false);
        onComplete(nextVersion, nextConfidence);
      }
    }, 320);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Retraining Simulation</p>
      <h3 className="text-lg font-semibold text-slate-900">
        Trigger Retraining (Simulated)
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Uses reviewed cases to mock a new model build.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          color="info"
          disabled={!canRetrain || isRetraining}
          onClick={handleRetrain}
        >
          {isRetraining ? "Retraining..." : "Trigger Retraining"}
        </Button>
        {!canRetrain && <Badge color="warning">Awaiting reviewed cases</Badge>}
        {isRetraining && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" />
            Updating weights
          </div>
        )}
      </div>
      <div className="mt-4">
        <Progress progress={progress} color="info" size="sm" />
        <p className="mt-2 text-xs text-slate-500">
          Current model {currentVersion} • Confidence target {currentConfidence}%
        </p>
      </div>
    </div>
  );
};

export default RetrainingSimulationPanel;
