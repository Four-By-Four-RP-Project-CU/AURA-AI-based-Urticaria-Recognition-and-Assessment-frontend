import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Progress } from "flowbite-react";
import { FaHeartbeat, FaMicroscope, FaUserMd } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import {
  getCases,
  getDashboard,
  getDiseaseType,
  submitCaseReview,
} from "../api/clinicianApi";

const diseaseType = getDiseaseType();
function resolveScore(scores, code) {
  if (!Array.isArray(scores)) return null;
  const match = scores.find((item) => item.code === code);
  return match ? match.value : null;
}

function deriveStatus(uctValue) {
  if (uctValue == null) return "Unknown";
  if (uctValue >= 12) return "Controlled";
  if (uctValue >= 8) return "Partially Controlled";
  return "Uncontrolled";
}

function confidenceToLabel(uncertaintyValue) {
  if (uncertaintyValue == null) return "Unknown";
  if (uncertaintyValue >= 0.4) return "High";
  if (uncertaintyValue >= 0.2) return "Medium";
  return "Low";
}

function TooltipText({ text, tooltip }) {
  if (!tooltip) {
    return <span>{text}</span>;
  }
  return (
    <span className="group relative inline-flex cursor-help">
      <span>{text}</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}

function LabeledValue({ label, value, tooltip, valueClassName = "" }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={`text-lg font-semibold text-slate-800 dark:text-slate-100 ${valueClassName}`}
      >
        <TooltipText text={value} tooltip={tooltip} />
      </span>
    </div>
  );
}

function ProbabilityBar({ label, value }) {
  const percent = Math.round(value * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-base text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span className="font-semibold">{percent}%</span>
      </div>
      <Progress progress={percent} color="cyan" size="md" />
    </div>
  );
}

function FeatureBar({ name, value }) {
  const percent = Math.min(Math.abs(value) * 100, 100);
  const isPositive = value >= 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-base text-slate-700 dark:text-slate-200">
        <span>{name}</span>
        <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
          {isPositive ? "+" : "-"}
          {Math.abs(value).toFixed(2)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${
            isPositive ? "bg-emerald-500" : "bg-rose-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function NarrativeRow({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-base text-slate-800 dark:text-slate-100">
        {value || "Insufficient data"}
      </p>
    </div>
  );
}

export default function ClinicianPatientDetail() {
  const { patientId } = useParams();
  const fallbackPatient = {
    id: patientId,
    age: 0,
    gender: "Unknown",
  };
  const cardClass =
    "bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-white/60 dark:border-slate-700/60 shadow-lg";
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState([]);
  const [caseProfile, setCaseProfile] = useState(fallbackPatient);
  const [dashboard, setDashboard] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExplainabilityLoading, setIsExplainabilityLoading] = useState(false);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomImage(null);
      }
    };
    if (zoomImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomImage]);

  useEffect(() => {
    let isMounted = true;
    const fetchPatientDashboard = async () => {
      setIsLoading(true);
      setIsExplainabilityLoading(false);
      setIsLlmLoading(false);
      setApiError(null);
      try {
        const [casesResponse, baseDashboardResponse] = await Promise.all([
          getCases(),
          getDashboard(patientId, diseaseType, false, false),
        ]);
        if (isMounted) {
          const matchedCase = casesResponse.find(
            (entry) => entry.caseId === patientId
          );
          setCaseProfile(
            matchedCase
              ? {
                  id: matchedCase.caseId,
                  age: matchedCase.age,
                  gender: matchedCase.gender || "Unknown",
                }
              : fallbackPatient
          );
          setDashboard(baseDashboardResponse);
          setIsLoading(false);
        }
        if (isMounted) {
          setIsExplainabilityLoading(true);
        }
        const explainabilityDashboardResponse = await getDashboard(
          patientId,
          diseaseType,
          true,
          false
        );
        if (isMounted) {
          setDashboard((prev) => ({ ...(prev || {}), ...explainabilityDashboardResponse }));
          setIsExplainabilityLoading(false);
          setIsLlmLoading(true);
        }
        const llmDashboardResponse = await getDashboard(
          patientId,
          diseaseType,
          true,
          true
        );
        if (isMounted) {
          setDashboard((prev) => ({ ...(prev || {}), ...llmDashboardResponse }));
        }
      } catch (error) {
        if (isMounted) {
          setApiError("Backend unavailable, unable to load patient data.");
          setIsLoading(false);
          setIsExplainabilityLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsLlmLoading(false);
        }
      }
    };

    fetchPatientDashboard();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const uctValue = resolveScore(dashboard?.scores, "UCT");
  const aectValue = resolveScore(dashboard?.scores, "AECT");
  const controlStatus = deriveStatus(uctValue);
  const predictionConfidence = dashboard?.prediction?.confidence;
  const confidencePercent = Number.isFinite(predictionConfidence)
    ? Math.round(predictionConfidence * 100)
    : 0;
  const subtype = dashboard?.prediction?.label || "N/A";
  const subtypeProbabilities = dashboard?.prediction?.probabilities
    ? Object.entries(dashboard.prediction.probabilities).map(
        ([label, value]) => ({
          label,
          value,
        })
      )
    : [];
  const uncertaintyLabel =
    dashboard?.prediction?.uncertainty != null
      ? confidenceToLabel(dashboard.prediction.uncertainty)
      : "N/A";
  const treatmentPlan = dashboard?.treatmentPlan;
  const risks = dashboard?.risks || [];
  const shapFeatures = dashboard?.explanation?.shapContributions
    ? dashboard.explanation.shapContributions.map((feature) => ({
        name: feature.feature,
        value: feature.contribution,
      }))
    : [];
  const baseImageUrl = dashboard?.explanation?.gradCam?.baseImageUrl || "";
  const gradCamUrl = dashboard?.explanation?.gradCam?.heatmapUrl || "";
  const recommendations = dashboard?.recommendations || [];
  const warningFlags = dashboard?.warningFlags || [];
  const diseaseControlTooltip = dashboard?.diseaseControlInfo?.tooltip || "";
  const llmExplainability = dashboard?.llmExplainability;

  const handleCaseAction = async (finalStatus) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await submitCaseReview(patientId, finalStatus, {
        comment: reviewComment,
      });
      setReviewStatus(finalStatus);
    } catch (error) {
      setApiError("Unable to update case status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 px-6 py-12 text-slate-900 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900"
    >
      {zoomImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            className="max-h-full max-w-full rounded-xl shadow-2xl"
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-br from-cyan-400 to-teal-500"
              style={{
                left: particle.left,
                top: particle.top,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `particle-float-${(particle.id % 4) + 1} ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                transform: `translate(${(mousePosition.x - 50) * 0.05}px, ${
                  (mousePosition.y - 50) * 0.05
                }px)`,
                transition: "transform 0.3s ease-out",
              }}
            />
          ))}
        </div>
        <div
          className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.25}px, ${
              mousePosition.y * 0.25
            }px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl animate-pulse animation-delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.2}px, ${
              mousePosition.y * 0.2
            }px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl animate-pulse animation-delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.15}px, ${
              -mousePosition.y * 0.15
            }px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute left-10 top-20 animate-float-slow opacity-30 transition-all duration-500"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${
              mousePosition.y * 0.1
            }px)`,
          }}
        >
          <FaMicroscope className="text-6xl text-cyan-400" />
        </div>
        <div
          className="absolute right-20 top-40 animate-float-medium opacity-30 transition-all duration-500"
          style={{
            transform: `translate(${-mousePosition.x * 0.08}px, ${
              mousePosition.y * 0.08
            }px)`,
          }}
        >
          <FaHeartbeat className="text-6xl text-teal-400" />
        </div>
        <div
          className="absolute bottom-40 right-40 animate-float-fast opacity-30 transition-all duration-500"
          style={{
            transform: `translate(${mousePosition.x * 0.12}px, ${
              -mousePosition.y * 0.12
            }px)`,
          }}
        >
          <FaUserMd className="text-6xl text-sky-400" />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md animate-fade-in">
            Patient-level AI review
          </span>
          {isLoading ? (
            <span className="text-sm font-semibold text-cyan-700">
              Syncing explainability payload...
            </span>
          ) : null}
          {apiError ? (
            <span className="text-sm font-semibold text-rose-600">
              {apiError}
            </span>
          ) : null}
          <h1 className="text-5xl font-semibold text-slate-900 dark:text-white md:text-7xl animate-slide-up">
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-teal-400 dark:to-sky-400">
              Patient {caseProfile.id}
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 md:text-2xl animate-fade-in-delay">
            Review predictions, explainability, and clinician actions.
          </p>
          <Link
            to="/clinician-dashboard"
            className="inline-flex text-base font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            ← Back to patient list
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-5 animate-fade-in-delay-2">
          <Card className={`lg:col-span-3 ${cardClass}`}>
            <SectionHeader title="Patient Details" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LabeledValue label="Patient ID" value={caseProfile.id} />
              <LabeledValue
                label="Age"
                value={caseProfile.age ? `${caseProfile.age} years` : "N/A"}
              />
              <LabeledValue label="Gender" value={caseProfile.gender} />
              <LabeledValue
                label="Urticaria Type"
                value={subtype}
                tooltip="Predicted urticaria type (e.g., CSU or CIndU)."
              />
              <LabeledValue label="Confidence" value={`${confidencePercent}%`} />
              <LabeledValue
                label="Disease control"
                value={controlStatus}
                tooltip={diseaseControlTooltip}
              />
              <LabeledValue
                label="Shape"
                value={dashboard?.patientSummary?.shape || "N/A"}
                tooltip="Observed wheal shape from clinical record."
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge color="info">
                <TooltipText
                  text={`UCT ${uctValue ?? "N/A"}`}
                  tooltip="UCT = Urticaria Control Test total score."
                />
              </Badge>
              <Badge color="info">
                <TooltipText
                  text={`AECT ${aectValue ?? "N/A"}`}
                  tooltip="AECT = Angioedema Control Test total score."
                />
              </Badge>
              <Badge color="warning">
                <TooltipText text={controlStatus} tooltip={diseaseControlTooltip} />
              </Badge>
              {warningFlags.map((flag) => (
                <Badge key={flag} color="failure">
                  {flag}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className={`lg:col-span-2 ${cardClass}`}>
            <SectionHeader title="Predicted Outputs" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <LabeledValue
                  label="Predicted Drug"
                  value={treatmentPlan?.predictedDrug || "N/A"}
                  valueClassName="text-base break-words"
                />
                <LabeledValue
                  label="Predicted Step"
                  value={treatmentPlan?.predictedStep || "N/A"}
                  valueClassName="text-base"
                />
                <div className="space-y-2">
                  <LabeledValue
                    label="Confidence"
                    value={`${confidencePercent}%`}
                    valueClassName="text-base"
                  />
                  <Progress progress={confidencePercent} color="cyan" size="md" />
                </div>
              </div>
              <div className="space-y-4">
                <LabeledValue
                  label="Side-Effect Risk"
                  value={risks.find((risk) => risk.type === "Side Effect")?.level || "N/A"}
                  valueClassName="text-base"
                />
                <LabeledValue
                  label="Hypersensitivity Risk"
                  value={risks.find((risk) => risk.type === "Hypersensitivity")?.level || "N/A"}
                  valueClassName="text-base"
                />
                <LabeledValue
                  label="Secondary Disease Risk"
                  value={risks.find((risk) => risk.type === "Secondary Disease")?.level || "N/A"}
                  valueClassName="text-base"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-delay-3">
          <Card className={`lg:col-span-3 ${cardClass}`}>
            <SectionHeader
              title="Explainability"
              subtitle="Feature contributions and imaging outputs."
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Key factors influencing the assessment
                </p>
                <div className="space-y-3">
                  {isExplainabilityLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading SHAP feature contributions...
                    </p>
                  ) : shapFeatures.length ? (
                    shapFeatures.map((feature) => (
                      <FeatureBar
                        key={feature.name}
                        name={feature.name}
                        value={feature.value}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">SHAP feature contributions are unavailable for the current source record.</p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Imaging outputs
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-lg border border-cyan-100/60 dark:border-slate-700/60">
                    {isExplainabilityLoading ? (
                      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                        Loading clinical image...
                      </div>
                    ) : baseImageUrl ? (
                      <>
                        <img
                          src={baseImageUrl}
                          alt="Clinical image"
                          className="h-72 w-full cursor-zoom-in object-cover"
                          onClick={(event) => {
                            event.stopPropagation();
                            setZoomImage({ src: baseImageUrl, alt: "Clinical image" });
                          }}
                        />
                        <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                          Original image
                        </div>
                      </>
                    ) : (
                      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                        No clinical image.
                      </div>
                    )}
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-cyan-100/60 dark:border-slate-700/60">
                    {isExplainabilityLoading ? (
                      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                        Loading Grad-CAM image...
                      </div>
                    ) : gradCamUrl ? (
                      <>
                        <img
                          src={gradCamUrl}
                          alt="Grad-CAM heatmap"
                          className="h-72 w-full cursor-zoom-in object-cover"
                          onClick={(event) => {
                            event.stopPropagation();
                            setZoomImage({ src: gradCamUrl, alt: "Grad-CAM heatmap" });
                          }}
                        />
                        <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                          Grad-CAM heatmap
                        </div>
                      </>
                    ) : (
                      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                        No Grad-CAM image.
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Note: Image visibility may vary depending on brightness, contrast, and image clarity. Heatmap emphasis should be interpreted together with the original clinical image.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-delay-3">
          <Card className={`lg:col-span-3 ${cardClass}`}>
            <SectionHeader
              title="Clinical Interpretation Summary"
              subtitle="Clinician-readable summary generated from structured explainability evidence."
            />
            {isLlmLoading ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading clinical interpretation summary...
              </p>
            ) : !llmExplainability ? (
              <p className="mt-6 text-sm text-slate-500">
                Clinical interpretation summary unavailable. Structured SHAP and Grad-CAM evidence remains visible.
              </p>
            ) : (
              <div className="mt-6 grid gap-5">
                <NarrativeRow
                  label="Summary"
                  value={llmExplainability.summary}
                />
                <NarrativeRow
                  label="WHY THIS DECISION WAS MADE"
                  value={llmExplainability.decisionRationale}
                />
                <NarrativeRow
                  label="Evidence from tabular data"
                  value={llmExplainability.tabularEvidence}
                />
                <NarrativeRow
                  label="Evidence from image"
                  value={llmExplainability.imageEvidence}
                />
                <NarrativeRow
                  label="Control status"
                  value={llmExplainability.controlStatus}
                />

                <NarrativeRow
                  label="Safety note"
                  value={llmExplainability.safetyNote}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 animate-fade-in-delay-2">
          <Card className={`lg:col-span-3 ${cardClass}`}>
            <SectionHeader title="Guideline Recommendations" />
            {recommendations.length ? (
              <div className="mt-6 space-y-4">
                {recommendations.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="space-y-1">
                    <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {item.type || "Guideline"}
                    </p>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {item.text || "N/A"}
                    </p>
                    <span className="text-xs font-semibold text-cyan-600">
                      {item.guidelineTag || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No recommendations available.</p>
            )}
          </Card>
          <Card className={`lg:col-span-2 ${cardClass}`}>
            <SectionHeader title="Clinician Actions" />
            <p className="mt-6 text-base text-slate-600 dark:text-slate-300">
              Update final status and save clinician notes.
            </p>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Clinician comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Add clinical notes or context for review"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Comments are local only until review integration is enabled.
              </span>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                color="success"
                onClick={() => handleCaseAction("Accepted")}
                disabled={isSubmitting}
              >
                Accept
              </Button>
              <Button
                color="light"
                onClick={() => handleCaseAction("NEED_REVIEW")}
                disabled={isSubmitting}
              >
                Clinician Review
              </Button>
            </div>
            {reviewStatus ? (
              <p className="mt-4 text-sm font-semibold text-emerald-600">
                Final status: {reviewStatus}
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
