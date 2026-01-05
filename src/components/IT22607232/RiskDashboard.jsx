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
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: patientData })
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

  // Decision Status Card
  const DecisionCard = () => {
    const isAbstain = result?.abstain || false;
    const decision = result?.final_decision || 'UNKNOWN';
    
    return (
      <Card className={`transform transition-all duration-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAbstain ? (
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
                Clinical Decision
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isAbstain ? 'Requires Manual Review' : 'AI-Assisted Prediction'}
              </p>
            </div>
          </div>
          <Badge 
            color={isAbstain ? 'warning' : 'success'} 
            size="xl"
            className="px-6 py-3 text-lg font-bold"
          >
            {decision}
          </Badge>
        </div>
        
        {result?.abstain_reason && (
          <Alert color="warning" icon={HiInformationCircle} className="mt-4">
            <span className="font-semibold">Abstention Reason: </span>
            {result.abstain_reason}
          </Alert>
        )}

        {/* Confidence Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type Confidence</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {(result?.confidence?.type_confidence * 100).toFixed(1)}%
            </p>
            <Progress 
              progress={(result?.confidence?.type_confidence * 100)} 
              color="cyan"
              className="mt-2"
            />
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prediction Entropy</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {result?.confidence?.type_entropy?.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Lower is better (threshold: {result?.confidence?.thresholds?.type_entropy_thresh?.toFixed(2)})
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // Urticaria Type Card
  const UrticariaTypeCard = () => {
    const typeData = result?.urticaria_type || {};
    const probs = typeData.probs || {};
    const sortedProbs = Object.entries(probs).sort((a, b) => b[1] - a[1]);

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
          <p className="text-3xl font-bold">{typeData.pred}</p>
          {typeData.pred !== typeData.raw_pred && (
            <p className="text-sm mt-2 opacity-80">
              Raw prediction: {typeData.raw_pred}
            </p>
          )}
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
    const sideData = result?.side_effect_risk_proxy || {};
    const probs = sideData.probs || {};
    const riskLevel = sideData.pred || 'UNKNOWN';

    const getRiskColor = (level) => {
      if (level.includes('LOW')) return { bg: 'from-green-500 to-emerald-500', badge: 'success' };
      if (level.includes('MED')) return { bg: 'from-yellow-500 to-orange-500', badge: 'warning' };
      if (level.includes('HIGH')) return { bg: 'from-red-500 to-pink-500', badge: 'failure' };
      return { bg: 'from-gray-500 to-slate-500', badge: 'gray' };
    };

    const colors = getRiskColor(riskLevel);

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

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(probs).map(([level, prob]) => (
            <div key={level} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{level}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(prob * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Severity Gauge Card
  const SeverityCard = () => {
    const severity = result?.severity || {};
    const mu = severity.mu || 0;
    const ci95 = severity.ci95 || [0, 0];
    const range = severity.range || [0, 10];
    const percentage = ((mu - range[0]) / (range[1] - range[0])) * 100;

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
            <p className="text-sm text-gray-600 dark:text-gray-400">out of {range[1]}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Variance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {severity.var?.toFixed(3)}
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
    const risks = result?.secondary_risk || {};
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
            const isHigh = probability > 0.6;
            const isMedium = probability > 0.3 && probability <= 0.6;
            
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
                    {(probability * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  progress={probability * 100} 
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

  // Safety Alert Card
  const SafetyCard = () => {
    const safety = result?.safety || {};
    const hasViolations = safety.safety_flag || false;
    const rules = safety.rules_triggered || [];
    const score = safety.violation_score || 0;

    if (!hasViolations) {
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
                No safety rule violations detected
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
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Safety Alert Triggered
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {rules.length} safety rule violation{rules.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>

        <Alert color="failure" icon={HiExclamation} className="mb-4">
          <span className="font-bold">Violation Score: {score.toFixed(3)}</span>
        </Alert>

        <div className="space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Triggered Rules:</p>
          {rules.map((rule, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-300 dark:border-red-700"
            >
              <HiExclamation className="text-xl text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">
                  {rule.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getAlertDescription(rule)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Alert color="warning" icon={HiInformationCircle} className="mt-4">
          <span className="font-semibold">Clinical Recommendation: </span>
          Manual review required. Consider additional diagnostic tests and specialist consultation.
        </Alert>
      </Card>
    );
  };

  // Fusion Gates Card (Model Insights)
  const FusionGatesCard = () => {
    const gates = result?.fusion_gates_mean || {};
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
      {/* Decision Status - Full Width */}
      <DecisionCard />

      {/* Safety Alert - Full Width if triggered */}
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
        <span className="font-semibold">Disclaimer: </span>
        {result.disclaimer}
      </Alert>
    </div>
  );
}
