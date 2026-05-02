import React, { useEffect, useRef, useState } from "react";
import { Badge, Card } from "flowbite-react";
import { FaHeartbeat, FaMicroscope, FaUserMd } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCases, getDashboard, getDiseaseType } from "../api/clinicianApi";

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

// Maps backend DiseaseControlInfo.status enum to display label
function statusLabel(backendStatus) {
  switch (backendStatus) {
    case "CONTROLLED":         return "Controlled";
    case "PARTIALLY_CONTROLLED": return "Partially Controlled";
    case "UNCONTROLLED":       return "Uncontrolled";
    default:                   return "Unknown";
  }
}

function controlStatusTooltip(status) {
  if (status === "Controlled") {
    return "Symptoms are well controlled. The patient reports minimal or no impact from urticaria in daily life.";
  }
  if (status === "Partially Controlled") {
    return "Symptoms are present but not fully controlled. The patient experiences intermittent symptoms or moderate impact on daily activities.";
  }
  if (status === "Uncontrolled") {
    return "Symptoms are poorly controlled. The patient reports frequent or severe symptoms with significant impact on daily life.";
  }
  return "";
}

function TooltipText({ text, tooltip }) {
  if (!tooltip) {
    return <span>{text}</span>;
  }
  return (
    <span className="group relative inline-flex cursor-help">
      <span>{text}</span>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}

function LabeledValue({ label, value, tooltip }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <TooltipText text={label} tooltip={tooltip} />
      </span>
      <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {value}
      </span>
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

export default function ClinicianDashboard() {
  const cardClass =
    "bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-white/60 dark:border-slate-700/60 shadow-lg";
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [subtypeFilter, setSubtypeFilter] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedGenderFilter, setAppliedGenderFilter] = useState("");
  const [appliedSubtypeFilter, setAppliedSubtypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;
  const genderOptions = [...new Set(patients.map((p) => p.gender))];
  const subtypeOptions = [...new Set(patients.map((p) => p.subtype))];
  const filteredPatients = patients.filter((patient) => {
    const query = appliedSearchTerm.trim().toLowerCase();
    const matchesId = query
      ? patient.id.toLowerCase().includes(query)
      : true;
    const matchesGender =
      !appliedGenderFilter || patient.gender === appliedGenderFilter;
    const matchesSubtype =
      !appliedSubtypeFilter || patient.subtype === appliedSubtypeFilter;
    return matchesId && matchesGender && matchesSubtype;
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientsPerPage)
  );
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );
  const startIndex = filteredPatients.length
    ? (currentPage - 1) * patientsPerPage + 1
    : 0;
  const endIndex = filteredPatients.length
    ? Math.min(currentPage * patientsPerPage, filteredPatients.length)
    : 0;
  const controlledCount = filteredPatients.filter(
    (patient) => patient.resultStatus === "Controlled"
  ).length;
  const partialCount = filteredPatients.filter(
    (patient) => patient.resultStatus === "Partially Controlled"
  ).length;
  const uncontrolledCount = filteredPatients.filter(
    (patient) => patient.resultStatus === "Uncontrolled"
  ).length;

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
    let isMounted = true;
    const fetchDashboards = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const cases = await getCases();
        const responses = await Promise.all(
          cases.map((caseItem) =>
            getDashboard(caseItem.caseId, diseaseType, false).then((dashboard) => {
              const uctValue = resolveScore(dashboard.scores, "UCT");
              const aectValue = resolveScore(dashboard.scores, "AECT");
              const confidenceValue = dashboard.prediction?.confidence;
              const confidence = Number.isFinite(confidenceValue)
                ? Math.round(confidenceValue * 100)
                : null;
              const backendStatus = dashboard.diseaseControlInfo?.status;
              const resultStatus = backendStatus
                ? statusLabel(backendStatus)
                : deriveStatus(uctValue);
              return {
                id: caseItem.caseId,
                age: caseItem.age,
                gender: caseItem.gender,
                subtype: dashboard.prediction?.label || "N/A",
                confidence: confidence ?? 0,
                uct: uctValue,
                aect: aectValue,
                resultStatus,
                controlTooltip: dashboard.diseaseControlInfo?.tooltip || "",
              };
            })
          )
        );
        if (isMounted) {
          setPatients(responses);
          setCurrentPage(1);
        }
      } catch (error) {
        if (isMounted) {
          setApiError("Backend unavailable, unable to load cases.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboards();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedGenderFilter, appliedSubtypeFilter]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 px-6 py-12 text-slate-900 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900"
    >
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
            Clinician-only AI delivery view
          </span>
          {isLoading ? (
            <span className="text-sm font-semibold text-cyan-700">
              Syncing dashboard signals...
            </span>
          ) : null}
          {apiError ? (
            <span className="text-sm font-semibold text-rose-600">
              {apiError}
            </span>
          ) : null}
          <h1 className="text-5xl font-semibold text-slate-900 dark:text-white md:text-7xl animate-slide-up">
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-teal-400 dark:to-sky-400">
              Delivery &amp; Explainability Dashboard
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 md:text-2xl animate-fade-in-delay">
            Clinician dashboard for patient intake, triage, and AI result
            review.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-delay-2">
          <Card className={`lg:col-span-2 ${cardClass}`}>
            <SectionHeader
              title="Patient Overview"
              subtitle="Active cohort count and control status."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-cyan-100/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Total patients
                </p>
                <p className="text-3xl font-semibold text-slate-800 dark:text-white md:text-4xl">
                  {patients.length}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-100/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  <TooltipText
                    text="Controlled"
                    tooltip={controlStatusTooltip("Controlled")}
                  />
                </p>
                <p className="text-3xl font-semibold text-emerald-600 md:text-4xl">
                  {controlledCount}
                </p>
              </div>
              <div className="rounded-lg border border-rose-100/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <p className="text-base text-slate-500 dark:text-slate-400">
                  <TooltipText
                    text="Uncontrolled"
                    tooltip={controlStatusTooltip("Uncontrolled")}
                  />
                </p>
                <p className="text-3xl font-semibold text-rose-600 md:text-4xl">
                  {uncontrolledCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className={cardClass}>
            <SectionHeader title="Status Mix" />
            <div className="mt-6 space-y-4">
              <LabeledValue
                label="Controlled"
                value={controlledCount}
                tooltip={controlStatusTooltip("Controlled")}
              />
              <LabeledValue
                label="Partially Controlled"
                value={partialCount}
                tooltip={controlStatusTooltip("Partially Controlled")}
              />
              <LabeledValue
                label="Uncontrolled"
                value={uncontrolledCount}
                tooltip={controlStatusTooltip("Uncontrolled")}
              />
            </div>
          </Card>
        </div>

        <Card className={`${cardClass} animate-fade-in-delay-3`}>
          <SectionHeader
            title="Patient List"
            subtitle="Select a patient to review predictions and explainability."
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by patient ID"
              className="w-full max-w-sm rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
              className="w-full max-w-[180px] rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Filter by gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={subtypeFilter}
              onChange={(event) => setSubtypeFilter(event.target.value)}
              className="w-full max-w-[200px] rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Filter by subtype</option>
              {subtypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
              onClick={() => {
                setAppliedSearchTerm(searchTerm);
                setAppliedGenderFilter(genderFilter);
                setAppliedSubtypeFilter(subtypeFilter);
              }}
            >
              Search
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              onClick={() => {
                setSearchTerm("");
                setGenderFilter("");
                setSubtypeFilter("");
                setAppliedSearchTerm("");
                setAppliedGenderFilter("");
                setAppliedSubtypeFilter("");
              }}
            >
              Clear
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredPatients.length} results
            </span>
          </div>
          <div className="mt-6 overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base text-slate-700 dark:text-slate-200">
              <thead className="sticky top-0 z-10 bg-white/90 text-sm uppercase tracking-wide text-slate-500 backdrop-blur dark:bg-slate-900/90 dark:text-slate-400">
                <tr className="border-b border-slate-200/70 dark:border-slate-700/60">
                  <th className="py-3 pr-4">Patient ID</th>
                  <th className="py-3 pr-4">Age</th>
                  <th className="py-3 pr-4">Gender</th>
                  <th className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      Urticaria Type
                      <TooltipText
                        text="ⓘ"
                        tooltip="Predicted urticaria type (e.g., CSU or CIndU)."
                      />
                    </span>
                  </th>
                  <th className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      UCT/AECT
                      <TooltipText
                        text="ⓘ"
                        tooltip="UCT = Urticaria Control Test, AECT = Angioedema Control Test."
                      />
                    </span>
                  </th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                {paginatedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100/70 last:border-b-0 dark:border-slate-800/60"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-white">
                      {patient.id}
                    </td>
                    <td className="py-4 pr-4">{patient.age}</td>
                    <td className="py-4 pr-4">{patient.gender}</td>
                    <td className="py-4 pr-4">{patient.subtype}</td>
                    <td className="py-4 pr-4">
                      {patient.uct ?? "N/A"}/{patient.aect ?? "N/A"}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge
                        color={
                          patient.resultStatus === "Controlled"
                            ? "success"
                            : patient.resultStatus === "Uncontrolled"
                              ? "failure"
                              : "warning"
                        }
                      >
                        <TooltipText
                          text={patient.resultStatus}
                          tooltip={patient.controlTooltip}
                        />
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/clinician-dashboard/${patient.id}`}
                        className="font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
                {!paginatedPatients.length ? (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={7}>
                      No cases match the current filter.
                    </td>
                  </tr>
                ) : null}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {startIndex}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {filteredPatients.length}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={`h-9 w-9 rounded-full border text-sm font-semibold transition ${
                      page === currentPage
                        ? "border-cyan-500 bg-cyan-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
