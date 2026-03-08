import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, ResponsiveContainer, Legend,
} from "recharts";
import {
  HiArrowLeft, HiShieldCheck, HiShieldExclamation, HiExclamation,
  HiCheckCircle, HiInformationCircle, HiLightningBolt,
  HiChartBar, HiHeart, HiChip, HiBeaker, HiPrinter,
  HiDownload, HiSparkles, HiTrendingUp, HiTrendingDown,
  HiVolumeUp, HiX,
} from "react-icons/hi";

// ─── Colour helpers ───────────────────────────────────────────────────────────
const SEVERITY_COLOR = (s) => {
  if (s <= 2.5) return { ring: "#10b981", bg: "from-green-400 to-emerald-500", text: "text-green-600 dark:text-green-400", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
  if (s <= 5)   return { ring: "#f59e0b", bg: "from-yellow-400 to-orange-400", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  if (s <= 7.5) return { ring: "#f97316", bg: "from-orange-500 to-red-500", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" };
  return { ring: "#ef4444", bg: "from-red-600 to-rose-700", text: "text-red-600 dark:text-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
};

const SE_COLOR = (lvl) => ({
  LOW:      { ring: "#10b981", bg: "from-green-400 to-emerald-400",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  MODERATE: { ring: "#f59e0b", bg: "from-amber-400 to-orange-400",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  HIGH:     { ring: "#ef4444", bg: "from-red-500 to-rose-500",       badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
}[lvl] || { ring: "#6b7280", bg: "from-gray-500 to-slate-500", badge: "bg-gray-100 text-gray-700" });

const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#f97316", "#ec4899", "#3b82f6", "#14b8a6"];

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimNum({ target, decimals = 1, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 25);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

// ─── SVG Arc Gauge ────────────────────────────────────────────────────────────
function ArcGauge({ value, max = 10, color, label, size = 180 }) {
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const circumference = Math.PI * r; // half circle
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} className="overflow-visible">
      {/* track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth={size * 0.12} strokeLinecap="round"
        className="dark:stroke-gray-700"
      />
      {/* fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth={size * 0.12} strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* text */}
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 dark:fill-white" fontSize={size * 0.19} fontWeight="bold">
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize={size * 0.085} className="fill-gray-500 dark:fill-gray-400">
        {label}
      </text>
    </svg>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ flag, label }) {
  return flag ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
      <HiExclamation className="w-3 h-3" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-semibold">
      <HiCheckCircle className="w-3 h-3" /> Low Risk
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, gradient, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className={`p-4 bg-gradient-to-r ${gradient} text-white flex items-center gap-3`}>
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-base">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Composite Score Ring ─────────────────────────────────────────────────────
function CompositeRing({ score }) {
  const pct = score * 100;
  const c = 2 * Math.PI * 54;
  const offset = c * (1 - score);
  const col = score < 0.33 ? "#10b981" : score < 0.66 ? "#f59e0b" : "#ef4444";
  const label = score < 0.33 ? "LOW" : score < 0.66 ? "MODERATE" : "HIGH";
  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={54} fill="none" stroke="#e5e7eb" strokeWidth={12} className="dark:stroke-gray-700" />
        <circle cx={70} cy={70} r={54} fill="none" stroke={col} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x={70} y={65} textAnchor="middle" fontSize={22} fontWeight="bold" fill={col}>{(score * 100).toFixed(0)}</text>
        <text x={70} y={82} textAnchor="middle" fontSize={9} fill="#6b7280">/ 100</text>
      </svg>
      <span className="mt-1 text-sm font-bold" style={{ color: col }}>{label} COMPOSITE RISK</span>
    </div>
  );
}

// ─── Custom Tooltip for Bar/Radar ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) + "%" : p.value}</strong></p>
      ))}
    </div>
  );
};

// ─── Main Results Page ────────────────────────────────────────────────────────
export default function RiskResultsPage() {
  const navigate = useNavigate();
  const printRef = useRef();
  const [raw, setRaw] = useState(null);
  const [visible, setVisible] = useState(false);

  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("aura_risk_result");
    if (!stored) { navigate("/risk-assessment"); return; }
    try {
      setRaw(JSON.parse(stored));
      setTimeout(() => setVisible(true), 100);
    } catch { navigate("/risk-assessment"); }
  }, [navigate]);

  const speakResults = () => {
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    if (!raw) return;
    const { result: R2, form: f } = raw;
    const sv = R2.severity?.predicted_score ?? 0;
    const text = [
      "AURA AI Risk Profile Results.",
      `Urticaria type: ${R2.urticaria_type?.predicted ?? "unknown"}, with ${(R2.urticaria_type?.confidence_pct ?? 0).toFixed(1)} percent confidence.`,
      `Symptom severity score: ${sv.toFixed(1)} out of 10. Band: ${R2.severity?.band ?? ""}.`,
      R2.severity?.description ? R2.severity.description : "",
      `Side-effect risk level: ${R2.sideeffect_risk?.level ?? "unknown"}.`,
      R2.sideeffect_risk?.high_risk_flag ? "A high-risk flag has been raised for side effects." : "Side-effect risk is within acceptable limits.",
      `Thyroid disease risk: ${(R2.secondary_disease_risk?.thyroid_risk_pct ?? 0).toFixed(1)} percent.`,
      R2.secondary_disease_risk?.thyroid_flag ? "Thyroid risk flag raised." : "",
      `Autoimmune disease risk: ${(R2.secondary_disease_risk?.autoimmune_risk_pct ?? 0).toFixed(1)} percent.`,
      R2.secondary_disease_risk?.autoimmune_flag ? "Autoimmune risk flag raised." : "",
      `Overall composite risk score: ${((R2.composite_risk_score ?? 0) * 100).toFixed(0)} out of 100.`,
      R2.clinical_interpretation ? `Clinical interpretation: ${R2.clinical_interpretation}` : "",
    ].filter(Boolean).join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.0;
    u.onend  = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(u);
  };

  if (!raw) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <span className="animate-spin rounded-full border-4 border-cyan-500 border-t-transparent w-12 h-12" />
    </div>
  );

  const { result, form, ocrData } = raw;
  const R = result;

  // ── derive values ──────────────────────────────────────────────────────────
  const sevScore = R.severity?.predicted_score ?? 0;
  const sevCI    = R.severity?.uncertainty_95ci ?? [0, 0];
  const sevBand  = R.severity?.band ?? "UNKNOWN";
  const sevDesc  = R.severity?.description ?? "";
  const sevColors = SEVERITY_COLOR(sevScore);

  const seLevel  = R.sideeffect_risk?.level ?? "UNKNOWN";
  const seDist   = R.sideeffect_risk?.distribution ?? {};
  const seFlag   = R.sideeffect_risk?.high_risk_flag ?? false;
  const seColors = SE_COLOR(seLevel);

  const utType   = R.urticaria_type?.predicted ?? "—";
  const utConf   = R.urticaria_type?.confidence_pct ?? 0;
  const utDist   = R.urticaria_type?.distribution ?? {};

  const thyRisk  = R.secondary_disease_risk?.thyroid_risk_pct ?? 0;
  const autRisk  = R.secondary_disease_risk?.autoimmune_risk_pct ?? 0;
  const thyFlag  = R.secondary_disease_risk?.thyroid_flag ?? false;
  const autFlag  = R.secondary_disease_risk?.autoimmune_flag ?? false;

  const composite = R.composite_risk_score ?? 0;
  const interp    = R.clinical_interpretation ?? "";
  const gates     = R.modality_gates ?? {};

  // ── chart data ─────────────────────────────────────────────────────────────
  const utBarData = Object.entries(utDist).map(([k, v]) => ({ name: k, value: parseFloat(v.toFixed(1)) }));
  const seBarData = Object.entries(seDist).map(([k, v]) => ({ name: k, value: parseFloat(v.toFixed(1)) }));

  const radarData = [
    { subject: "Thyroid Risk", value: thyRisk, fullMark: 100 },
    { subject: "Autoimmune Risk", value: autRisk, fullMark: 100 },
    { subject: "Side-Effect Risk", value: seDist["HIGH"] ?? 0, fullMark: 100 },
    { subject: "Severity", value: sevScore * 10, fullMark: 100 },
    { subject: "Composite", value: composite * 100, fullMark: 100 },
    { subject: "CU Confidence", value: utConf, fullMark: 100 },
  ];

  const labData = [
    { name: "CRP", value: form.CRP ? parseFloat(form.CRP) : null, unit: "mg/L", normal: 5, color: "#06b6d4" },
    { name: "FT4", value: form.FT4 ? parseFloat(form.FT4) : null, unit: "ng/dL", normal: 1.8, color: "#8b5cf6" },
    { name: "IgE", value: form.IgE ? parseFloat(form.IgE) : null, unit: "IU/mL", normal: 100, color: "#f59e0b" },
    { name: "VitD", value: form.VitD ? parseFloat(form.VitD) : null, unit: "ng/mL", normal: 30, color: "#10b981" },
  ].filter((d) => d.value !== null);

  const gateBarData = Object.entries(gates).map(([k, v]) => ({
    name: k.replace("gate_", "").replace(/_/g, " ").toUpperCase(),
    text: parseFloat((v * 100).toFixed(1)),
    lab: parseFloat(((1 - v) * 100).toFixed(1)),
  }));

  return (
    <div
      ref={printRef}
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 p-4 sm:p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/risk-assessment")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            <HiArrowLeft className="w-4 h-4" /> New Assessment
          </button>
          <div className="flex gap-2">
            <button
              onClick={speakResults}
              title={speaking ? "Stop speaking" : "Read results aloud"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border ${
                speaking
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {speaking ? <><HiX className="w-4 h-4" /> Stop</> : <><HiVolumeUp className="w-4 h-4" /> Speak Results</>}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <HiPrinter className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                a.download = `AURA_Risk_Profile_${Date.now()}.json`; a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-all shadow-sm"
            >
              <HiDownload className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white"
                style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 1 - i * 0.1 }} />
            ))}
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-cyan-200 text-sm font-medium">
                <HiSparkles className="w-4 h-4" /> AURA AI Analysis Complete
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Risk Profile Report</h1>
              <p className="text-cyan-200 text-sm">
                {form.Age ? `Age ${form.Age}` : ""}{form.Sex ? ` · ${form.Sex}` : ""} · {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {ocrData && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1 rounded-full">
                  <HiSparkles className="w-3 h-3" /> OCR lab values included
                </div>
              )}
            </div>
            <CompositeRing score={composite} />
          </div>
        </div>

        {/* ── Clinical Interpretation ── */}
        {interp && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 flex gap-3">
            <HiInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">Clinical Interpretation</p>
              <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">{interp}</p>
            </div>
          </div>
        )}

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "CU Type", value: utType, sub: `${utConf.toFixed(1)}% confident`, icon: HiChip, color: "from-blue-500 to-indigo-500" },
            { label: "Severity Band", value: sevBand, sub: `Score ${sevScore.toFixed(1)}/10`, icon: HiChartBar, color: sevColors.bg },
            { label: "Side-Effect Risk", value: seLevel, sub: seFlag ? "⚠ Flag raised" : "Within limits", icon: HiLightningBolt, color: seColors.bg },
            { label: "Secondary Risk", value: thyFlag || autFlag ? "FLAG" : "CLEAR", sub: `Thyroid ${thyRisk.toFixed(0)}% · Auto ${autRisk.toFixed(0)}%`, icon: HiHeart, color: thyFlag || autFlag ? "from-red-500 to-rose-500" : "from-green-500 to-emerald-500" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${color}`} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-10`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 3-column grid: Radar + Severity + Side-Effect ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Radar chart */}
          <Section title="Multi-Domain Risk Radar" icon={HiChartBar} gradient="from-cyan-600 to-blue-600">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Risk %" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>

          {/* Severity gauge */}
          <Section title="Symptom Severity Score" icon={HiTrendingUp} gradient={`bg-gradient-to-r ${sevColors.bg}`}>
            <div className="flex flex-col items-center gap-3">
              <ArcGauge value={sevScore} max={10} color={sevColors.ring} label="/ 10" size={200} />
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${sevColors.badge}`}>{sevBand}</span>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>95% CI</span>
                  <span>[{sevCI[0].toFixed(1)}, {sevCI[1].toFixed(1)}]</span>
                </div>
                <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="absolute h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full"
                    style={{ left: `${(sevCI[0] / 10) * 100}%`, width: `${((sevCI[1] - sevCI[0]) / 10) * 100}%` }} />
                  <div className="absolute h-full w-1 bg-red-500 rounded-full"
                    style={{ left: `${(sevScore / 10) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{sevDesc}</p>
              </div>
            </div>
          </Section>

          {/* Side-effect risk */}
          <Section title="Side-Effect Risk Profile" icon={HiLightningBolt} gradient={`bg-gradient-to-r ${seColors.bg}`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${seColors.bg} flex items-center justify-center shadow-lg`}>
                <div className="text-center text-white">
                  <div className="text-2xl font-extrabold">{seLevel}</div>
                  <div className="text-xs opacity-80">risk level</div>
                </div>
              </div>
              <RiskBadge flag={seFlag} label="High Risk Flag" />
              <div className="w-full space-y-2 mt-2">
                {seBarData.map(({ name, value }) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{value.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${name === "HIGH" ? "bg-red-500" : name === "MODERATE" ? "bg-amber-400" : "bg-green-400"}`}
                        style={{ width: `${value}%`, transition: "width 1s ease" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ── Urticaria Type Full Distribution ── */}
        <Section title="CU Type Classification — Probability Distribution" icon={HiChip} gradient="from-indigo-600 to-blue-600">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={utBarData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="value" name="Probability" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                    {utBarData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={i === 0 ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:w-64 flex flex-col items-center gap-3">
              <div className="w-full p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700 text-center">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Predicted Type</p>
                <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 leading-tight">{utType}</p>
                <p className="text-lg font-bold text-indigo-500 mt-1"><AnimNum target={utConf} />% confidence</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={utBarData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} strokeWidth={0} isAnimationActive={false}>
                    {utBarData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={i === 0 ? 1 : 0.55} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {/* ── Secondary Disease Risk ── */}
        <Section title="Secondary Disease Risk — Thyroid & Autoimmune" icon={HiHeart} gradient="from-pink-600 to-rose-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Thyroid Disease Risk", value: thyRisk, flag: thyFlag, color: "#8b5cf6", bg: "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20", border: "border-violet-200 dark:border-violet-700", Icon: thyFlag ? HiTrendingUp : HiTrendingDown },
              { label: "Autoimmune Disease Risk", value: autRisk, flag: autFlag, color: "#ec4899", bg: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20", border: "border-pink-200 dark:border-pink-700", Icon: autFlag ? HiTrendingUp : HiTrendingDown },
            ].map(({ label, value, flag, color, bg, border, Icon }) => (
              <div key={label} className={`p-5 rounded-2xl bg-gradient-to-br ${bg} border ${border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{label}</p>
                    <RiskBadge flag={flag} label="Elevated Risk" />
                  </div>
                  <Icon className={`w-8 h-8 ${flag ? "text-red-500" : "text-green-500"}`} />
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-extrabold" style={{ color }}><AnimNum target={value} decimals={1} />%</span>
                  <span className="text-gray-400 text-sm mb-1.5">probability</span>
                </div>
                <div className="space-y-1.5">
                  {[25, 50, 75].map((thresh) => (
                    <div key={thresh} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className={`w-2 h-2 rounded-full ${value >= thresh ? "bg-red-400" : "bg-gray-300"}`} />
                      {thresh}% threshold {value >= thresh ? "EXCEEDED" : "not reached"}
                    </div>
                  ))}
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: "Thyroid Risk", value: thyRisk }, { name: "Normal", value: 100 - thyRisk }]}
                    cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0} isAnimationActive={false}>
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#e5e7eb" className="dark:fill-gray-700" />
                  </Pie>
                  <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold" fill="#8b5cf6">{thyRisk.toFixed(1)}%</text>
                  <text x="50%" y="62%" textAnchor="middle" fontSize={10} fill="#6b7280">Thyroid</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: "Autoimmune Risk", value: autRisk }, { name: "Normal", value: 100 - autRisk }]}
                    cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0} isAnimationActive={false}>
                    <Cell fill="#ec4899" />
                    <Cell fill="#e5e7eb" className="dark:fill-gray-700" />
                  </Pie>
                  <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold" fill="#ec4899">{autRisk.toFixed(1)}%</text>
                  <text x="50%" y="62%" textAnchor="middle" fontSize={10} fill="#6b7280">Autoimmune</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {/* ── Lab Values vs Reference ── */}
        {labData.length > 0 && (
          <Section title="Lab Values vs. Reference Range" icon={HiBeaker} gradient="from-teal-600 to-cyan-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {labData.map(({ name, value, unit, normal, color }) => {
                const abnormal = value > normal;
                return (
                  <div key={name} className="p-4 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{name}</p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color }}>{value}</p>
                    <p className="text-xs text-gray-400">{unit}</p>
                    <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${abnormal ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"}`}>
                      {abnormal ? "Above Normal" : "Normal"}
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min((value / (normal * 2)) * 100, 100)}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Ref ≤ {normal}</p>
                    {ocrData && ocrData[name] != null && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        OCR
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={labData.map((d) => ({ ...d, ref: d.normal }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Your Value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {labData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
                <Bar dataKey="ref" name="Reference Max" fill="#e5e7eb" className="dark:fill-gray-600" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* ── Fusion/Modality Gates ── */}
        {gateBarData.length > 0 && (
          <Section title="AI Modality Fusion Gates — How the Model Weighted Data" icon={HiChip} gradient="from-violet-600 to-indigo-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              The Gated Fusion MTL model dynamically weights lab-tabular data vs. clinical text (NLP) for each prediction task.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gateBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="lab" name="Lab/Tabular Weight %" fill="#06b6d4" stackId="a" radius={[0, 0, 0, 4]} isAnimationActive={false} />
                <Bar dataKey="text" name="Text/NLP Weight %" fill="#8b5cf6" stackId="a" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-sm bg-cyan-500" />
                Lab/Tabular data weight — structured clinical measurements
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-sm bg-violet-500" />
                Text/NLP weight — symptoms & investigation notes via Bio_ClinicalBERT
              </div>
            </div>
          </Section>
        )}

        {/* ── OCR Audit Trail ── */}
        {ocrData && (
          <Section title="OCR Lab Extraction Audit" icon={HiSparkles} gradient="from-violet-600 to-purple-600">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["CRP", "FT4", "IgE", "VitD"].map((k) => (
                <div key={k} className={`p-4 rounded-xl text-center border ${ocrData[k] != null ? "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700" : "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"}`}>
                  <p className="text-xs font-medium text-gray-500 mb-1">{k}</p>
                  {ocrData[k] != null ? (
                    <><p className="text-xl font-extrabold text-violet-700 dark:text-violet-300">{ocrData[k]}</p>
                      <p className="text-xs text-violet-500 mt-1 flex items-center justify-center gap-1"><HiCheckCircle className="w-3 h-3" /> Extracted</p></>
                  ) : (
                    <><p className="text-xl font-bold text-gray-400">—</p>
                      <p className="text-xs text-gray-400 mt-1">Not found</p></>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Disclaimer ── */}
        <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 text-sm text-amber-800 dark:text-amber-300">
          <HiInformationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Clinical Disclaimer:</strong> This AI-generated report is intended to assist clinical decision-making and should not replace professional medical judgment.
            All findings must be interpreted by a qualified healthcare professional in the context of the patient's full clinical presentation.
          </div>
        </div>
      </div>
    </div>
  );
}
