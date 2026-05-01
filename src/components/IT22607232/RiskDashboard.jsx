// RiskDashboard — lightweight summary widget used inside DashboardNew.jsx
// Full interactive results live at /risk-results (RiskResultsPage.jsx)
import React, { useState, useEffect } from 'react';
import { Card, Badge, Progress, Alert, Spinner } from 'flowbite-react';
import { 
  HiShieldCheck, 
  HiShieldExclamation, 
  HiExclamation, 
  HiCheckCircle, 
  HiInformationCircle,
  HiLightningBolt,
  HiChartBar,
  HiChip,
  HiBeaker,
  HiHeart
} from 'react-icons/hi';

export default function RiskDashboard({ patientData }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    if (patientData) {
      handlePredict();
    }
  }, [patientData]);

  useEffect(() => {
    if (result) {
      setTimeout(() => setAnimateCards(true), 100);
    }
  }, [result]);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnimateCards(false);

    try {
      // Build the PredictRequest body matching the actual backend schema
      const catKeys = [
        'Sex','History of Chronic Urticaria','Symptoms Of Urticaria',
        'Duration of Symptoms of urticaria','If Wheals are present',
        'The shape of an individual wheal','Size of a single Wheal',
        'No. of wheals','Duration of wheal','Location',
        'If  angioedema is present','Duration of angioedema',
        'Discomfort of Swelling','Affect of Swelling on Daily activities',
        'Angioedema affect on appearance','Overall affect of Swelling',
        'Which applies to your wheals/angioedema or both?',
        'Which of the following applies to your symptoms of urticaria?',
        'Which time of the day do the symptoms occur?',
        'Symptoms of Autoinflamation:','Alpha Gal','Specify other allergy',
        'Remission of Angioedema after discontinuation of the drug:',
        'Family History of Urticaria','Family history of thyroid diseases',
        'Family history of autoimmune diseases',
      ];
      const categorical = {};
      catKeys.forEach((k) => { if (patientData[k]) categorical[k] = patientData[k]; });
      if (patientData.gender) categorical['Sex'] = patientData.gender;

      const body = {
        symptoms_raw: patientData.symptoms_raw || '',
        investigations_raw: patientData.investigations_raw || '',
        categorical,
      };
      if (patientData.Age)      body.Age = Number(patientData.Age);
      if (patientData.age)      body.Age = Number(patientData.age);
      if (patientData.Weight)   body.Weight = Number(patientData.Weight);
      if (patientData.Height)   body.Height = Number(patientData.Height);
      if (patientData['Diagnosed at the age of']) body.diagnosed_age = Number(patientData['Diagnosed at the age of']);
      if (patientData.CRP)      body.CRP = Number(patientData.CRP);
      if (patientData.FT4)      body.FT4 = Number(patientData.FT4);
      if (patientData.IgE)      body.IgE = Number(patientData.IgE);
      if (patientData.VitD)     body.VitD = Number(patientData.VitD);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Summary Card (replaces old "Decision" card to match real schema) ─────────
  const SummaryCard = () => {
    const composite = result?.composite_risk_score ?? 0;
    const interp    = result?.clinical_interpretation ?? '';
    const seFlag    = result?.sideeffect_risk?.high_risk_flag ?? false;
    const thyFlag   = result?.secondary_disease_risk?.thyroid_flag ?? false;
    const autFlag   = result?.secondary_disease_risk?.autoimmune_flag ?? false;
    const hasFlag   = seFlag || thyFlag || autFlag;

    return (
      <Card className={`transform transition-all duration-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {hasFlag ? (
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <HiExclamation className="text-4xl text-white" />
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <HiShieldCheck className="text-4xl text-white" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Risk Assessment Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {hasFlag ? 'Clinical attention recommended' : 'AI-Assisted Multi-Task Prediction'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Composite Risk</p>
            <p className={`text-3xl font-extrabold ${composite > 0.66 ? 'text-red-600' : composite > 0.33 ? 'text-amber-500' : 'text-green-600'}`}>
              {(composite * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {interp && (
          <Alert color="info" icon={HiInformationCircle} className="mt-4">
            <span className="font-semibold">Clinical Interpretation: </span>
            {interp}
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Composite Risk</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{(composite * 100).toFixed(0)}%</p>
            <Progress progress={composite * 100} color="cyan" className="mt-2" />
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Thyroid Risk</p>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{(result?.secondary_disease_risk?.thyroid_risk_pct ?? 0).toFixed(1)}%</p>
            <Progress progress={result?.secondary_disease_risk?.thyroid_risk_pct ?? 0} color="pink" className="mt-2" />
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Autoimmune Risk</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(result?.secondary_disease_risk?.autoimmune_risk_pct ?? 0).toFixed(1)}%</p>
            <Progress progress={result?.secondary_disease_risk?.autoimmune_risk_pct ?? 0} color="purple" className="mt-2" />
          </div>
        </div>
      </Card>
    );
  };

  // Urticaria Type Card
  const UrticariaTypeCard = () => {
    const typeData = result?.urticaria_type || {};
    // backend returns: predicted, confidence_pct, distribution (dict label→pct)
    const predicted = typeData.predicted ?? typeData.pred ?? '—';
    const confPct   = typeData.confidence_pct ?? 0;
    const dist      = typeData.distribution ?? typeData.probs ?? {};
    const sortedProbs = Object.entries(dist).sort((a, b) => b[1] - a[1]);

    return (
      <Card className={`transform transition-all duration-700 delay-100 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <HiChip className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Urticaria Type</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Classification Result</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 mb-4">
          <p className="text-sm opacity-90 mb-2">Predicted Type</p>
          <p className="text-3xl font-bold">{predicted}</p>
          <p className="text-sm mt-1 opacity-80">Confidence: {confPct.toFixed(1)}%</p>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-gray-700 dark:text-gray-300">Probability Distribution</p>
          {sortedProbs.map(([type, prob], idx) => (
            <div key={type}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                progress={prob * 100} 
                color={idx === 0 ? 'blue' : 'gray'}
                size="lg"
              />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Side Effect Risk Card
  const SideEffectCard = () => {
    // backend: sideeffect_risk.level, sideeffect_risk.distribution, sideeffect_risk.high_risk_flag
    const sideData = result?.sideeffect_risk || result?.side_effect_risk_proxy || {};
    const dist     = sideData.distribution || sideData.probs || {};
    const riskLevel = sideData.level || sideData.pred || 'UNKNOWN';
    const highFlag  = sideData.high_risk_flag ?? false;

    const getRiskColor = (level) => {
      if (level.includes('LOW'))  return { bg: 'from-green-500 to-emerald-500', badge: 'success' };
      if (level.includes('MOD'))  return { bg: 'from-yellow-500 to-orange-500', badge: 'warning' };
      if (level.includes('HIGH')) return { bg: 'from-red-500 to-pink-500', badge: 'failure' };
      return { bg: 'from-gray-500 to-slate-500', badge: 'gray' };
    };

    const colors = getRiskColor(riskLevel);
    const probs = dist;  // keep name for the JSX below

    return (
      <Card className={`transform transition-all duration-700 delay-200 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-lg`}>
            <HiLightningBolt className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Side Effect Risk</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Treatment Risk Assessment</p>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${colors.bg} text-white rounded-xl p-6 mb-4`}>
          <p className="text-sm opacity-90 mb-2">Risk Level</p>
          <p className="text-4xl font-bold">{riskLevel}</p>
        </div>

        {highFlag && (
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            <HiExclamation className="w-4 h-4" /> High-Risk Flag Raised — Clinical Review Recommended
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(probs).map(([level, prob]) => (
            <div key={level} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{level}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof prob === 'number' ? prob.toFixed(1) : prob}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Severity Gauge Card
  const SeverityCard = () => {
    // backend: severity.predicted_score, severity.uncertainty_95ci, severity.band, severity.description
    const severity = result?.severity || {};
    const mu   = severity.predicted_score ?? severity.mu ?? 0;
    const ci95 = severity.uncertainty_95ci ?? severity.ci95 ?? [0, 0];
    const band = severity.band ?? '';
    const percentage = (mu / 10) * 100;

    const getSeverityColor = (value) => {
      if (value < 3) return 'from-green-400 to-emerald-500';
      if (value < 6) return 'from-yellow-400 to-orange-500';
      return 'from-orange-500 to-red-600';
    };

    return (
      <Card className={`transform transition-all duration-700 delay-300 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 bg-gradient-to-br ${getSeverityColor(mu)} rounded-lg`}>
            <HiChartBar className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Severity Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Clinical Severity Assessment</p>
          </div>
        </div>

        {/* Large Circular Gauge */}
        <div className="relative w-full aspect-square max-w-xs mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="url(#severityGradient)"
              strokeWidth="12"
              strokeDasharray={`${percentage * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="severityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mu < 3 ? '#10b981' : mu < 6 ? '#f59e0b' : '#ef4444'} />
                <stop offset="100%" stopColor={mu < 3 ? '#059669' : mu < 6 ? '#dc2626' : '#991b1b'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-6xl font-bold text-gray-900 dark:text-white">
              {mu.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">out of 10 &nbsp;&bull;&nbsp; <span className="font-semibold">{band}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Severity Band</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {band || '—'}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">95% CI</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              [{ci95[0].toFixed(1)}, {ci95[1].toFixed(1)}]
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // Secondary Risk Card
  const SecondaryRiskCard = () => {
    // backend: secondary_disease_risk.thyroid_risk_pct, autoimmune_risk_pct, thyroid_flag, autoimmune_flag
    const sec = result?.secondary_disease_risk || result?.secondary_risk || {};
    const risks = {
      'Thyroid Disease': sec.thyroid_risk_pct ?? 0,
      'Autoimmune Disease': sec.autoimmune_risk_pct ?? 0,
    };
    const entries = Object.entries(risks).sort((a, b) => b[1] - a[1]);

    return (
      <Card className={`transform transition-all duration-700 delay-400 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <HiHeart className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secondary Risks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Additional Risk Factors</p>
          </div>
        </div>

        <div className="space-y-4">
          {entries.map(([riskType, probability], idx) => {
            // backend returns percentages (0–100), not fractions
            const isHigh   = probability > 60;
            const isMedium = probability > 30 && probability <= 60;
            
            return (
              <div 
                key={riskType}
                className={`p-4 rounded-lg border-2 ${
                  isHigh 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : isMedium 
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isHigh ? (
                      <HiExclamation className="text-2xl text-red-600" />
                    ) : isMedium ? (
                      <HiInformationCircle className="text-2xl text-yellow-600" />
                    ) : (
                      <HiCheckCircle className="text-2xl text-green-600" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {riskType}
                    </span>
                  </div>
                  <Badge 
                    color={isHigh ? 'failure' : isMedium ? 'warning' : 'success'}
                    size="lg"
                  >
                    {probability.toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  progress={probability} 
                  color={isHigh ? 'red' : isMedium ? 'yellow' : 'green'}
                  size="lg"
                />
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  // Safety Alert Card — only shown if backend includes a `safety` block or side-effect flags
  const SafetyCard = () => {
    const seFlag  = result?.sideeffect_risk?.high_risk_flag ?? false;
    const thyFlag = result?.secondary_disease_risk?.thyroid_flag ?? false;
    const autFlag = result?.secondary_disease_risk?.autoimmune_flag ?? false;
    const hasAnyFlag = seFlag || thyFlag || autFlag;

    if (!hasAnyFlag) {
      return (
        <Card className={`transform transition-all duration-700 delay-500 border-2 border-green-500 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <HiShieldCheck className="text-4xl text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                All Safety Checks Passed
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No clinical flags detected
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className={`transform transition-all duration-700 delay-500 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl animate-pulse">
            <HiShieldExclamation className="text-4xl text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Clinical Flags Detected</h3>
            <p className="text-gray-700 dark:text-gray-300">Manual clinical review recommended</p>
          </div>
        </div>
        <div className="space-y-2">
          {seFlag  && <Alert color="failure" icon={HiExclamation}><span className="font-semibold">Side-Effect High Risk Flag</span> — Elevated treatment risk detected.</Alert>}
          {thyFlag && <Alert color="warning" icon={HiInformationCircle}><span className="font-semibold">Thyroid Risk Flag</span> — Thyroid disease risk exceeds threshold.</Alert>}
          {autFlag && <Alert color="warning" icon={HiInformationCircle}><span className="font-semibold">Autoimmune Risk Flag</span> — Autoimmune disease risk exceeds threshold.</Alert>}
        </div>
        <Alert color="warning" icon={HiInformationCircle} className="mt-4">
          <span className="font-semibold">Clinical Recommendation: </span>
          Consider additional diagnostic tests and specialist consultation.
        </Alert>
      </Card>
    );
  };

  // Fusion Gates Card (Model Insights)
  const FusionGatesCard = () => {
    // backend returns modality_gates: {gate_type: 0.x, gate_sideeffect: 0.x, ...}
    const gates = result?.modality_gates || result?.fusion_gates_mean || {};
    const entries = Object.entries(gates);

    return (
      <Card className={`transform transition-all duration-700 delay-600 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <HiBeaker className="text-3xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Model Fusion Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">How the AI weighted different data sources</p>
          </div>
        </div>

        <div className="space-y-4">
          {entries.map(([taskGate, weight]) => {
            const taskName = taskGate.replace('gate_', '').replace('_', ' ').toUpperCase();
            
            return (
              <div key={taskGate}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{taskName}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {(weight * 100).toFixed(1)}% Text Weight
                  </span>
                </div>
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-1000"
                    style={{ width: `${(1 - weight) * 100}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                      Lab Data
                    </span>
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${weight * 100}%` }}
                  >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                      Text Data
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Note:</span> Higher text weight indicates the model relied more on clinical notes and symptoms, 
            while lower values indicate more reliance on laboratory test results.
          </p>
        </div>
      </Card>
    );
  };

  const getAlertDescription = (rule) => {
    const descriptions = {
      'HIGH_IGE_BUT_LOW_SIDE_RISK': 'Patient has elevated IgE levels but the model predicted low side effect risk. This discrepancy warrants clinical review.',
      'ANGIOEDEMA_BUT_LOW_HIGH_RISK': 'Angioedema is present but the predicted high-risk probability is low. Consider additional evaluation.'
    };
    return descriptions[rule] || 'Safety rule triggered. Clinical review recommended.';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="xl" className="mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Analyzing patient data...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">AI model is processing your request</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" icon={HiExclamation}>
        <span className="font-semibold">Error: </span>
        {error}
      </Alert>
    );
  }

  if (!result) {
    return (
      <Card>
        <div className="text-center py-12">
          <HiInformationCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            No risk assessment data available
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Enter patient data to generate risk assessment
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary / Composite Risk — Full Width */}
      <SummaryCard />

      {/* Safety / Flag Alert — Full Width */}
      <SafetyCard />

      {/* Main Risk Metrics - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UrticariaTypeCard />
        <SideEffectCard />
      </div>

      {/* Severity and Secondary - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeverityCard />
        <SecondaryRiskCard />
      </div>

      {/* Model Insights - Full Width */}
      <FusionGatesCard />

      {/* Disclaimer */}
      <Alert color="info" icon={HiInformationCircle}>
        <span className="font-semibold">Clinical Disclaimer: </span>
        This AI-generated assessment is for clinical support only. Always interpret results with a qualified healthcare professional.
      </Alert>
    </div>
  );
}
