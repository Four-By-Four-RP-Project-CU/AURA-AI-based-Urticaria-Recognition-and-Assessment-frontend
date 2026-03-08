import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiChartBar, HiLightningBolt, HiShieldCheck, HiShieldExclamation,
  HiBeaker, HiSparkles, HiChip, HiHeart,
  HiExclamation, HiCheckCircle, HiArrowRight, HiRefresh,
  HiInformationCircle, HiDocumentReport, HiTrendingUp,
} from 'react-icons/hi';

//  Helpers 
function KpiCard({ icon: Icon, iconBg, label, value, sub, flag }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">{value}</p>
        {sub  && <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>}
        {flag && <span className="inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold"><HiExclamation className="w-3 h-3"/>Flag raised</span>}
      </div>
    </div>
  );
}

function RiskBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        <span>{label}</span><span>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const SEV_BAND_COLOR = { MILD: 'text-green-600', MODERATE: 'text-amber-500', SEVERE: 'text-orange-600', EXTREME: 'text-red-600' };
const SE_LEVEL_COLOR = { LOW: 'text-green-600', MODERATE: 'text-amber-500', HIGH: 'text-red-600' };
const COMPOSITE_COLOR = (c) => c > 0.66 ? 'text-red-600' : c > 0.33 ? 'text-amber-500' : 'text-green-600';

//  Quick-action tiles 
const ACTIONS = [
  {
    icon: HiSparkles,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    title: 'New Risk Assessment',
    desc: 'Run a full AI-powered CU risk & side-effect profile',
    href: '/risk-assessment',
    primary: true,
  },
  {
    icon: HiDocumentReport,
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    title: 'View Last Results',
    desc: 'Review detailed charts from most recent assessment',
    href: '/risk-results',
    primary: false,
  },
  {
    icon: HiDocumentReport,
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    title: 'Risk History',
    desc: 'View all your past risk profilings',
    href: '/risk-history',
    primary: false,
  },
];

//  Clinical reference banner items 
const GUIDANCE = [
  { tag: 'UAS7  28', note: 'Poorly controlled CU  consider step-up therapy or biologic (omalizumab).' },
  { tag: 'CRP > 10', note: 'Elevated inflammation marker  check for infectious or autoimmune trigger.' },
  { tag: 'IgE > 100', note: 'Elevated total IgE  assess for atopic co-morbidities and allergen sensitisation.' },
  { tag: 'FT4 < 0.8', note: 'Low free T4  possible hypothyroidism; 30% of CU patients have thyroid autoimmunity.' },
  { tag: 'VitD < 20', note: 'Vitamin D deficiency is associated with increased CU severity.' },
];

//  Main Component 
export default function DashboardNew() {
  const navigate  = useNavigate();
  const [last, setLast] = useState(null);   // parsed sessionStorage result
  const [tick, setTick] = useState(0);     // for manual refresh

  useEffect(() => {
    const raw = sessionStorage.getItem('aura_risk_result');
    if (raw) {
      try { setLast(JSON.parse(raw)); } catch {}
    }
  }, [tick]);

  const R   = last?.result ?? null;
  const hasResult = !!R;

  // KPI values derived from last result
  const composite   = R?.composite_risk_score ?? null;
  const sevScore    = R?.severity?.predicted_score ?? null;
  const sevBand     = R?.severity?.band ?? null;
  const seLevel     = R?.sideeffect_risk?.level ?? null;
  const seFlag      = R?.sideeffect_risk?.high_risk_flag ?? false;
  const cuType      = R?.urticaria_type?.predicted ?? null;
  const cuConf      = R?.urticaria_type?.confidence_pct ?? null;
  const thyPct      = R?.secondary_disease_risk?.thyroid_risk_pct ?? null;
  const autPct      = R?.secondary_disease_risk?.autoimmune_risk_pct ?? null;
  const thyFlag     = R?.secondary_disease_risk?.thyroid_flag ?? false;
  const autFlag     = R?.secondary_disease_risk?.autoimmune_flag ?? false;
  const interp      = R?.clinical_interpretation ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">

      {/*  Page Banner  */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-700 to-blue-800 px-6 py-7">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-1">
              <HiChip className="w-3.5 h-3.5" /> AURA  AI Risk Profiling
            </div>
            <h1 className="text-3xl font-extrabold text-white">Clinical Dashboard</h1>
            <p className="text-cyan-200 text-sm mt-1">
              Chronic Urticaria  Risk  Severity  Side-Effect  Secondary Disease
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasResult && (
              <button onClick={() => setTick(t => t + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 transition-all">
                <HiRefresh className="w-4 h-4" /> Refresh
              </button>
            )}
            <button onClick={() => navigate('/risk-assessment')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-cyan-700 font-bold text-sm hover:bg-cyan-50 transition-all shadow-md">
              <HiSparkles className="w-4 h-4" /> New Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/*  Status Banner  */}
        <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
          !hasResult
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : (thyFlag || autFlag || seFlag)
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        }`}>
          {!hasResult
            ? <HiInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            : (thyFlag || autFlag || seFlag)
              ? <HiShieldExclamation className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              : <HiShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className={`text-sm font-semibold ${
              !hasResult ? 'text-blue-800 dark:text-blue-300'
              : (thyFlag || autFlag || seFlag) ? 'text-amber-800 dark:text-amber-300'
              : 'text-green-800 dark:text-green-300'
            }`}>
              {!hasResult
                ? 'No assessment on record  run one to populate the dashboard'
                : (thyFlag || autFlag || seFlag)
                  ? 'Clinical flags raised  review secondary risk indicators below'
                  : 'Last assessment complete  all risk indicators within normal range'
              }
            </p>
            {interp && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{interp}</p>}
          </div>
        </div>

        {/*  KPI Row  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={HiTrendingUp}
            iconBg={hasResult ? (composite > 0.66 ? 'bg-red-500' : composite > 0.33 ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-400'}
            label="Composite Risk"
            value={hasResult ? `${(composite * 100).toFixed(0)}%` : ''}
            sub={hasResult ? 'Overall weighted risk score' : 'No data yet'}
          />
          <KpiCard
            icon={HiChartBar}
            iconBg={hasResult ? (sevScore > 6 ? 'bg-red-500' : sevScore > 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-400'}
            label="Severity Score"
            value={hasResult ? `${sevScore?.toFixed(1)} / 10` : ''}
            sub={sevBand ?? 'No data yet'}
          />
          <KpiCard
            icon={HiLightningBolt}
            iconBg={hasResult ? (seLevel === 'HIGH' ? 'bg-red-500' : seLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-green-500') : 'bg-gray-400'}
            label="Side-Effect Risk"
            value={seLevel ?? ''}
            sub={hasResult ? 'Treatment risk level' : 'No data yet'}
            flag={seFlag}
          />
          <KpiCard
            icon={HiChip}
            iconBg="bg-gradient-to-br from-indigo-500 to-blue-600"
            label="Urticaria Type"
            value={cuType ?? ''}
            sub={cuConf != null ? `${cuConf.toFixed(1)}% confidence` : 'No data yet'}
          />
        </div>

        {/*  Main content: secondary risks + quick actions  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Secondary Disease Risk Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-pink-700 px-5 py-4 flex items-center gap-2">
              <HiHeart className="w-5 h-5 text-white" />
              <h2 className="text-white font-bold">Secondary Disease Risk</h2>
              <span className="ml-auto text-xs text-rose-200">Thyroid & Autoimmune co-morbidity</span>
            </div>
            <div className="p-5 space-y-5">
              {hasResult ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Thyroid */}
                    <div className={`rounded-xl p-4 border ${thyFlag ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Thyroid Risk</p>
                      <p className={`text-3xl font-extrabold ${thyFlag ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{thyPct?.toFixed(1)}%</p>
                      {thyFlag && <span className="inline-flex items-center gap-1 text-xs mt-1 font-semibold text-red-700 dark:text-red-300"><HiExclamation className="w-3 h-3"/>Flag &gt; 50%</span>}
                      {!thyFlag && <p className="text-xs text-gray-400 mt-1">Within normal range</p>}
                    </div>
                    {/* Autoimmune */}
                    <div className={`rounded-xl p-4 border ${autFlag ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Autoimmune Risk</p>
                      <p className={`text-3xl font-extrabold ${autFlag ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{autPct?.toFixed(1)}%</p>
                      {autFlag && <span className="inline-flex items-center gap-1 text-xs mt-1 font-semibold text-red-700 dark:text-red-300"><HiExclamation className="w-3 h-3"/>Flag &gt; 50%</span>}
                      {!autFlag && <p className="text-xs text-gray-400 mt-1">Within normal range</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <RiskBar label="Thyroid Risk" pct={thyPct ?? 0} color={thyFlag ? 'bg-red-500' : 'bg-pink-400'} />
                    <RiskBar label="Autoimmune Risk" pct={autPct ?? 0} color={autFlag ? 'bg-red-500' : 'bg-purple-400'} />
                    <RiskBar label="Side-Effect Risk (HIGH %)" pct={R?.sideeffect_risk?.distribution?.HIGH ?? 0} color={seFlag ? 'bg-red-500' : 'bg-orange-400'} />
                    <RiskBar label="Composite Risk" pct={(composite ?? 0) * 100} color={composite > 0.66 ? 'bg-red-500' : composite > 0.33 ? 'bg-amber-400' : 'bg-green-400'} />
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => navigate('/risk-results')}
                      className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                      View full results <HiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
                  <HiChartBar className="w-12 h-12 opacity-30" />
                  <p className="text-sm">No assessment data yet</p>
                  <button onClick={() => navigate('/risk-assessment')}
                    className="mt-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-all">
                    Run Assessment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-1">Quick Actions</h2>
            {ACTIONS.map((a) => (
              <button key={a.href} onClick={() => navigate(a.href)}
                className={`w-full text-left rounded-2xl border p-4 flex items-start gap-3 transition-all hover:shadow-md group ${
                  a.primary
                    ? 'bg-gradient-to-br from-cyan-600 to-teal-700 border-transparent text-white shadow-lg hover:from-cyan-700 hover:to-teal-800'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700'
                }`}>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${a.primary ? 'bg-white/20' : a.iconBg}`}>
                  <a.icon className={`w-5 h-5 ${a.primary ? 'text-white' : 'text-white'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${a.primary ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{a.title}</p>
                  <p className={`text-xs mt-0.5 ${a.primary ? 'text-cyan-100' : 'text-gray-500 dark:text-gray-400'}`}>{a.desc}</p>
                </div>
                <HiArrowRight className={`w-4 h-4 ml-auto mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform ${a.primary ? 'text-white/70' : 'text-gray-300 dark:text-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/*  Urticaria Type Distribution  */}
        {hasResult && R?.urticaria_type?.distribution && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-5 py-4 flex items-center gap-2">
              <HiChip className="w-5 h-5 text-white" />
              <h2 className="text-white font-bold">Urticaria Type  Probability Distribution</h2>
              <span className="ml-auto text-xs text-indigo-200">GatedFusionMTL  Bio_ClinicalBERT</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {Object.entries(R.urticaria_type.distribution).map(([type, prob]) => {
                  const isTop = type === R.urticaria_type.predicted;
                  return (
                    <div key={type} className={`rounded-xl p-4 text-center border transition-all ${isTop ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isTop ? 'text-indigo-200' : 'text-gray-500'}`}>{type}</p>
                      <p className={`text-3xl font-extrabold ${isTop ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{prob.toFixed(1)}%</p>
                      {isTop && <span className="inline-flex items-center gap-1 text-xs mt-1 bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold"><HiCheckCircle className="w-3 h-3"/>Predicted</span>}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                {Object.entries(R.urticaria_type.distribution).map(([type, prob]) => (
                  <RiskBar key={type} label={type} pct={prob}
                    color={type === R.urticaria_type.predicted ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/*  Clinical Reference  */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-gray-800 px-5 py-4 flex items-center gap-2">
            <HiBeaker className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">Clinical Reference  AURA Decision Thresholds</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GUIDANCE.map((g) => (
              <div key={g.tag} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 flex-shrink-0">{g.tag}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{g.note}</p>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-md bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 flex-shrink-0">Severity  6</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">SEVERE band  consider biologic therapy escalation (omalizumab 300 mg q4w).</p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 flex-shrink-0">Composite &gt; 55%</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">HIGH composite  close monitoring, consider biologics or second-line agents.</p>
            </div>
          </div>
        </div>

        {/*  Model info footer  */}
        <div className="text-center pb-4 space-y-1">
          <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-500 dark:text-gray-300">GatedFusionMTL</span>  Multi-Task Learning with Bio_ClinicalBERT text encoder + tabular residual network</p>
          <p className="text-xs text-gray-400">4 simultaneous outputs: Urticaria Type  Severity Score  Side-Effect Risk  Secondary Disease Risk</p>
        </div>
      </div>
    </div>
  );
}
