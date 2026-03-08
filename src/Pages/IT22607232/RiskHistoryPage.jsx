import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiClock,
  HiTrash,
  HiEye,
  HiExclamation,
  HiCheckCircle,
  HiSearch,
  HiDocumentReport,
} from "react-icons/hi";

const HIST_KEY = "aura_risk_history";

// ── helpers ──────────────────────────────────────────────────────────────────

function severityBand(score) {
  if (score == null) return { label: "Unknown", color: "bg-gray-500" };
  if (score >= 75) return { label: "Critical", color: "bg-red-600" };
  if (score >= 50) return { label: "High", color: "bg-orange-500" };
  if (score >= 25) return { label: "Moderate", color: "bg-yellow-500" };
  return { label: "Low", color: "bg-emerald-500" };
}

function sideEffectBand(level) {
  const l = (level || "").toLowerCase();
  if (l.includes("high") || l.includes("severe")) return "bg-red-600";
  if (l.includes("mod")) return "bg-orange-500";
  return "bg-emerald-500";
}

function riskPct(v) {
  if (v == null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : Math.round(n > 1 ? n : n * 100);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Card ─────────────────────────────────────────────────────────────────────

function HistoryCard({ record, onView, onDelete }) {
  const { result = {}, form = {}, _ts, _id } = record;

  const compositeRisk = riskPct(result.composite_risk ?? result.risk_score);
  const severity = severityBand(riskPct(result.severity_score ?? result.severity));
  const sideEffect = result.side_effect_risk ?? result.side_effect_level ?? "—";
  const urtType = result.urticaria_type ?? result.predicted_type ?? "—";
  const thyroidRisk = riskPct(result.thyroid_risk);
  const autoimmuneRisk = riskPct(result.autoimmune_risk);
  const confidence = result.confidence != null ? Math.round(result.confidence * 100) : null;

  return (
    <div className="group rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-sm p-5 flex flex-col gap-4 hover:border-violet-500/60 transition-all hover:shadow-lg hover:shadow-violet-900/20">

      {/* Top row: date + badges */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <HiClock className="w-4 h-4 shrink-0" />
          <span>{formatDate(_ts)}</span>
          <span className="text-gray-600">· ID {String(_id).slice(-6)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${severity.color}`}>
            {severity.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${sideEffectBand(sideEffect)}`}>
            SE: {sideEffect}
          </span>
        </div>
      </div>

      {/* Core KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Composite risk */}
        <div className="rounded-xl bg-gray-900/60 p-3 flex flex-col items-center justify-center">
          <p className="text-2xl font-extrabold text-violet-400">
            {compositeRisk != null ? `${compositeRisk}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 text-center">Composite Risk</p>
        </div>

        {/* Urticaria type */}
        <div className="rounded-xl bg-gray-900/60 p-3 flex flex-col items-center justify-center">
          <p className="text-sm font-bold text-teal-300 text-center leading-tight">{urtType}</p>
          {confidence != null && (
            <p className="text-xs text-gray-400 mt-0.5">{confidence}% conf.</p>
          )}
          <p className="text-xs text-gray-400 text-center">Urticaria Type</p>
        </div>

        {/* Thyroid risk */}
        <div className="rounded-xl bg-gray-900/60 p-3 flex flex-col items-center justify-center">
          <p className={`text-2xl font-extrabold ${thyroidRisk != null && thyroidRisk >= 40 ? "text-orange-400" : "text-emerald-400"}`}>
            {thyroidRisk != null ? `${thyroidRisk}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 text-center">Thyroid Risk</p>
        </div>

        {/* Autoimmune risk */}
        <div className="rounded-xl bg-gray-900/60 p-3 flex flex-col items-center justify-center">
          <p className={`text-2xl font-extrabold ${autoimmuneRisk != null && autoimmuneRisk >= 40 ? "text-orange-400" : "text-cyan-400"}`}>
            {autoimmuneRisk != null ? `${autoimmuneRisk}%` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 text-center">Autoimmune Risk</p>
        </div>
      </div>

      {/* Secondary: key inputs used */}
      {form && Object.keys(form).some((k) => form[k]) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {form.Age && (
            <Tag label={`Age: ${form.Age}`} />
          )}
          {form.Sex && (
            <Tag label={`Sex: ${form.Sex}`} />
          )}
          {form["History of Chronic Urticaria"] && (
            <Tag label={`CU Hx: ${form["History of Chronic Urticaria"]}`} />
          )}
          {form["Family history of thyroid diseases"] && (
            <Tag label={`Thyroid Fhx: ${form["Family history of thyroid diseases"]}`} />
          )}
          {form["Family history of autoimmune diseases"] && (
            <Tag label={`AI Fhx: ${form["Family history of autoimmune diseases"]}`} />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onView(record)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 transition-colors"
        >
          <HiEye className="w-4 h-4" /> View Full Results
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="flex items-center justify-center gap-1 rounded-xl bg-gray-700 hover:bg-red-700/80 text-gray-300 hover:text-white text-sm font-semibold px-3 py-2 transition-colors"
          title="Delete this record"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-700/70 text-gray-300 text-xs px-2.5 py-0.5">
      {label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
        <HiDocumentReport className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-300">No Assessments Yet</h3>
      <p className="text-gray-500 max-w-sm text-sm">
        Run your first AI-powered risk & side-effect profile to see results here.
        All completed assessments are automatically saved.
      </p>
      <button
        onClick={onNew}
        className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
      >
        Start New Assessment
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RiskHistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {
      setRecords([]);
    }
  }, []);

  const persist = (updated) => {
    setRecords(updated);
    localStorage.setItem(HIST_KEY, JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    persist(records.filter((r) => r._id !== id));
  };

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    persist([]);
    setConfirmClear(false);
  };

  const handleView = (record) => {
    // Restore the snapshot to sessionStorage so RiskResultsPage can read it
    const { _id, _ts, ...snapshot } = record;
    sessionStorage.setItem("aura_risk_result", JSON.stringify(snapshot));
    navigate("/risk-results");
  };

  // Filter
  const filtered = records.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const type = (r.result?.urticaria_type ?? r.result?.predicted_type ?? "").toLowerCase();
    const date = formatDate(r._ts).toLowerCase();
    return type.includes(q) || date.includes(q);
  });

  const totalCount = records.length;
  const avgRisk =
    records.length > 0
      ? Math.round(
          records.reduce((acc, r) => {
            const v = riskPct(r.result?.composite_risk ?? r.result?.risk_score);
            return acc + (v ?? 0);
          }, 0) / records.length
        )
      : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Risk Assessment History
            </h1>
            <p className="text-gray-400 text-sm mt-1">All your past AURA risk profilings — stored locally on this device</p>
          </div>
          <button
            onClick={() => navigate("/risk-assessment")}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
          >
            + New Assessment
          </button>
        </div>

        {/* Stats strip */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-gray-800/60 border border-gray-700 px-5 py-4">
              <p className="text-3xl font-extrabold text-violet-400">{totalCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Assessments</p>
            </div>
            {avgRisk != null && (
              <div className="rounded-2xl bg-gray-800/60 border border-gray-700 px-5 py-4">
                <p className={`text-3xl font-extrabold ${avgRisk >= 50 ? "text-orange-400" : "text-emerald-400"}`}>
                  {avgRisk}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Average Composite Risk</p>
              </div>
            )}
            <div className="rounded-2xl bg-gray-800/60 border border-gray-700 px-5 py-4">
              <p className="text-sm font-semibold text-gray-300">{formatDate(records[0]?._ts)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Most Recent</p>
            </div>
          </div>
        )}

        {/* Search + Clear controls */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by urticaria type or date…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={handleClearAll}
              onBlur={() => setConfirmClear(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                confirmClear
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700"
              }`}
            >
              <HiTrash className="w-4 h-4" />
              {confirmClear ? "Confirm Clear All" : "Clear All"}
            </button>
          </div>
        )}

        {/* Warning if no results from filter */}
        {totalCount > 0 && filtered.length === 0 && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4">
            <HiExclamation className="w-5 h-5" />
            No assessments match your search.
          </div>
        )}

        {/* Cards grid */}
        {totalCount === 0 ? (
          <EmptyState onNew={() => navigate("/risk-assessment")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((rec) => (
              <HistoryCard
                key={rec._id}
                record={rec}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        {totalCount > 0 && (
          <p className="mt-10 text-center text-xs text-gray-600">
            <HiCheckCircle className="inline w-3.5 h-3.5 mr-1 text-gray-600" />
            Data is stored only on this device (localStorage). Clearing browser data will remove this history.
          </p>
        )}
      </div>
    </div>
  );
}
