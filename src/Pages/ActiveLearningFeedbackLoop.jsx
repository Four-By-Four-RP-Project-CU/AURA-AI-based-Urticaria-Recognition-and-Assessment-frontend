import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Label,
  Progress,
  Select,
  Spinner,
  Textarea,
} from "flowbite-react";

const mockCase = {
  caseId: "CASE-URT-2049",
  patientAge: 34,
  patientSex: "Female",
  prediction: {
    subtype: "Chronic Spontaneous Urticaria",
    controlLevel: "Partially Controlled",
    confidence: 66,
  },
  confidenceThreshold: 70,
  modelVersion: "v1.0",
  availableCorrections: [
    "Chronic Spontaneous Urticaria - Well Controlled",
    "Chronic Spontaneous Urticaria - Poorly Controlled",
    "Inducible Urticaria - Partially Controlled",
  ],
};

const modelDecision = {
  inferenceId: "INF-2024-09-22-1187",
  modelName: "UrticariaNet",
  modelVersion: "v1.0",
  inferenceTimestamp: "2024-09-22T10:14:21Z",
  confidenceThreshold: 70,
  predictedLabel: "Chronic Spontaneous Urticaria - Partially Controlled",
  topKPredictions: [
    {
      label: "Chronic Spontaneous Urticaria - Partially Controlled",
      probability: 66,
    },
    {
      label: "Inducible Urticaria - Partially Controlled",
      probability: 18,
    },
    {
      label: "Chronic Spontaneous Urticaria - Poorly Controlled",
      probability: 9,
    },
  ],
  decisionStatus: "NEEDS_REVIEW",
  decisionRule:
    "Flag predictions with confidence below the clinician review threshold.",
  decisionReason:
    "Top prediction confidence is 66%, which is below the 70% threshold.",
};

const getUncertaintyLevel = (confidence) => {
  if (confidence >= 85) return "Low";
  if (confidence >= 70) return "Medium";
  return "High";
};

const bumpModelVersion = (version) => {
  const [major, minor] = version.replace("v", "").split(".").map(Number);
  const nextMinor = (Number.isNaN(minor) ? 0 : minor) + 1;
  return `v${major}.${nextMinor}`;
};

const getDecisionStatusColor = (status) => {
  if (status === "AUTO_ACCEPTED") return "success";
  if (status === "NEEDS_REVIEW") return "warning";
  return "failure";
};

const ActiveLearningFeedbackLoop = () => {
  const [confidence, setConfidence] = useState(
    mockCase.prediction.confidence
  );
  const [modelVersion, setModelVersion] = useState(mockCase.modelVersion);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [clinicianComment, setClinicianComment] = useState("");
  const [correctedLabel, setCorrectedLabel] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainingProgress, setRetrainingProgress] = useState(0);

  const uncertaintyLevel = useMemo(
    () => getUncertaintyLevel(confidence),
    [confidence]
  );
  const isUncertainCase = confidence < mockCase.confidenceThreshold;

  const reviewedCount = feedbackEntries.length;
  const correctedCount = feedbackEntries.filter(
    (entry) => entry.clinicianAction === "Corrected"
  ).length;

  const handleFeedback = (action) => {
    if (action === "Corrected" && !correctedLabel) {
      setFeedbackError("Select a corrected label to continue.");
      return;
    }

    const entry = {
      caseId: mockCase.caseId,
      originalPrediction: `${mockCase.prediction.subtype} - ${mockCase.prediction.controlLevel}`,
      clinicianAction: action,
      correctedLabel: action === "Corrected" ? correctedLabel : "N/A",
      comment: clinicianComment.trim() || "No comment",
      timestamp: new Date().toISOString(),
    };

    setFeedbackEntries((prev) => [entry, ...prev]);
    setClinicianComment("");
    setCorrectedLabel("");
    setFeedbackError("");
  };

  const handleRetrain = () => {
    if (isRetraining) return;
    setIsRetraining(true);
    setRetrainingProgress(10);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 15;
      setRetrainingProgress(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(interval);
        setModelVersion((prev) => bumpModelVersion(prev));
        setConfidence((prev) => Math.min(prev + 4, 99));
        setIsRetraining(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Active Learning Module
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Continuous Model Refinement Through Clinician Feedback
          </h1>
          <p className="mt-2 text-slate-600">
            Demonstration of the feedback loop using mock data for evaluation
            and presentation.
          </p>
        </div>

        {/* Prediction → Uncertainty */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">AI Model Output</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {mockCase.prediction.subtype}
                </h2>
                <p className="text-slate-600">
                  Control Level: {mockCase.prediction.controlLevel}
                </p>
              </div>
              <Badge color="info" className="h-fit">
                Model {modelVersion}
              </Badge>
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Confidence Score</span>
                  <span className="font-semibold text-slate-900">
                    {confidence}%
                  </span>
                </div>
                <Progress
                  progress={confidence}
                  color={confidence >= 70 ? "teal" : "warning"}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Uncertainty Level</p>
                <Badge
                  color={
                    uncertaintyLevel === "High"
                      ? "failure"
                      : uncertaintyLevel === "Medium"
                      ? "warning"
                      : "success"
                  }
                >
                  {uncertaintyLevel}
                </Badge>
              </div>
              {isUncertainCase && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <span className="font-semibold">
                    Uncertain Case – Needs Review
                  </span>{" "}
                  (confidence below {mockCase.confidenceThreshold}%)
                </div>
              )}
            </div>
          </Card>

          {/* Feedback → Dataset Update */}
          <Card className="border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Clinician Feedback Panel
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Review Prediction
                </h2>
                <p className="text-slate-600">
                  Case {mockCase.caseId} • {mockCase.patientAge} y/o{" "}
                  {mockCase.patientSex}
                </p>
              </div>
              <Badge color="gray">Local Only</Badge>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <Label htmlFor="correctedLabel" value="Corrected Label (if needed)" />
                <Select
                  id="correctedLabel"
                  value={correctedLabel}
                  onChange={(event) => setCorrectedLabel(event.target.value)}
                >
                  <option value="">Select correction</option>
                  {mockCase.availableCorrections.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="clinicianComment" value="Clinician Comment (optional)" />
                <Textarea
                  id="clinicianComment"
                  rows={3}
                  placeholder="Add clinical notes or rationale."
                  value={clinicianComment}
                  onChange={(event) => setClinicianComment(event.target.value)}
                />
              </div>
              {feedbackError && (
                <p className="text-sm text-rose-600">{feedbackError}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button color="success" onClick={() => handleFeedback("Accepted")}>
                  Accept Prediction
                </Button>
                <Button color="warning" onClick={() => handleFeedback("Corrected")}>
                  Correct Prediction
                </Button>
                <Button color="failure" onClick={() => handleFeedback("Rejected")}>
                  Reject Prediction
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Pre-trained Model Decision */}
        <Card className="mt-6 border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Pre-trained Model Decision</p>
              <h2 className="text-xl font-semibold text-slate-900">
                Decision Trace for {modelDecision.inferenceId}
              </h2>
              <p className="text-sm text-slate-600">
                {modelDecision.modelName} {modelDecision.modelVersion} •{" "}
                {new Date(modelDecision.inferenceTimestamp).toLocaleString()}
              </p>
            </div>
            <Badge color={getDecisionStatusColor(modelDecision.decisionStatus)}>
              {modelDecision.decisionStatus}
            </Badge>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Decision Rule
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {modelDecision.decisionRule}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Reason: {modelDecision.decisionReason}
                </p>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Threshold Comparison</p>
                <p className="mt-2 text-sm text-slate-700">
                  Predicted label:{" "}
                  <span className="font-semibold text-slate-900">
                    {modelDecision.predictedLabel}
                  </span>
                </p>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>Confidence Threshold</span>
                  <span className="font-semibold text-slate-900">
                    {modelDecision.confidenceThreshold}%
                  </span>
                </div>
                <Progress
                  progress={modelDecision.topKPredictions[0].probability}
                  color={
                    modelDecision.topKPredictions[0].probability >=
                    modelDecision.confidenceThreshold
                      ? "teal"
                      : "warning"
                  }
                  size="sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Top confidence is{" "}
                  {modelDecision.topKPredictions[0].probability}%.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className="text-sm text-slate-500">Top-K Predictions</p>
              <div className="mt-3 space-y-4">
                {modelDecision.topKPredictions.map((item) => (
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
                    <Progress
                      progress={item.probability}
                      color="info"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback → Dataset Update */}
        <Card className="mt-6 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Feedback Storage (Mock)</p>
          <h3 className="text-lg font-semibold text-slate-900">
            Local Feedback Log
          </h3>
          <div className="mt-4 space-y-3">
            {feedbackEntries.length === 0 && (
              <p className="text-sm text-slate-500">
                No feedback captured yet.
              </p>
            )}
            {feedbackEntries.map((entry, index) => (
              <div
                key={`${entry.caseId}-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {entry.caseId}
                  </span>
                  <Badge color="info">{entry.clinicianAction}</Badge>
                </div>
                <p className="mt-1">
                  Original: {entry.originalPrediction}
                </p>
                <p>Correction: {entry.correctedLabel}</p>
                <p className="text-slate-500">Comment: {entry.comment}</p>
                <p className="text-xs text-slate-400">
                  Logged at {entry.timestamp}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Dataset Update → Retraining */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="border border-slate-200 shadow-sm lg:col-span-1">
            <p className="text-sm text-slate-500">Updated Dataset Indicator</p>
            <h3 className="text-lg font-semibold text-slate-900">
              Clinician-Reviewed Labels
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">Reviewed Cases</span>
                <Badge color="info">{reviewedCount}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-600">Corrected Cases</span>
                <Badge color="warning">{correctedCount}</Badge>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {reviewedCount > 0
                  ? "Dataset status: Updated with clinician labels."
                  : "Dataset status: Awaiting clinician feedback."}
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 shadow-sm lg:col-span-2">
            <p className="text-sm text-slate-500">Model Retraining Simulation</p>
            <h3 className="text-lg font-semibold text-slate-900">
              Trigger Mock Retraining
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Uses locally stored feedback to simulate model improvement.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  color="info"
                  onClick={handleRetrain}
                  disabled={reviewedCount === 0 || isRetraining}
                >
                  {isRetraining ? "Retraining..." : "Trigger Model Retraining (Simulated)"}
                </Button>
                {isRetraining && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Spinner size="sm" />
                    Updating weights & metrics
                  </div>
                )}
              </div>
              <Progress progress={retrainingProgress} color="info" size="sm" />
              <div className="text-sm text-slate-600">
                Current model version:{" "}
                <span className="font-semibold text-slate-900">
                  {modelVersion}
                </span>{" "}
                • Updated confidence target:{" "}
                <span className="font-semibold text-slate-900">
                  {confidence}%
                </span>
              </div>
              {reviewedCount === 0 && (
                <p className="text-xs text-amber-700">
                  Add clinician feedback before retraining.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Redeployment */}
        <Card className="mt-6 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Redeployment Status</p>
          <h3 className="text-lg font-semibold text-slate-900">
            Active Learning Loop
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge color="success">Updated model deployed</Badge>
            <Badge color="info">Loop continues</Badge>
            <Badge color="gray">Active Learning Enabled</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            The system is ready to ingest new uncertain cases and repeat the
            feedback cycle.
          </p>
        </Card>

      </div>
    </div>
  );
};

export default ActiveLearningFeedbackLoop;
