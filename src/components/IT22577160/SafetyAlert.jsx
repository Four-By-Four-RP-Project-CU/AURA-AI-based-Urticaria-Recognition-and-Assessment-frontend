import React, { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTimes, 
  FaCheckCircle,
  FaBan,
  FaPills,
  FaAllergies,
  FaHeartbeat
} from 'react-icons/fa';

const SafetyAlert = ({ 
  severity, 
  title, 
  message, 
  violatedRule,
  recommendation,
  affectedMedication,
  onDismiss,
  onOverride,
  canOverride = false 
}) => {
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-500',
          text: 'text-red-800 dark:text-red-300',
          icon: <FaBan size={24} />
        };
      case 'high':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          border: 'border-orange-500',
          text: 'text-orange-800 dark:text-orange-300',
          icon: <FaExclamationTriangle size={24} />
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          border: 'border-yellow-500',
          text: 'text-yellow-800 dark:text-yellow-300',
          icon: <FaExclamationCircle size={24} />
        };
      case 'low':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-500',
          text: 'text-blue-800 dark:text-blue-300',
          icon: <FaInfoCircle size={24} />
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          border: 'border-gray-500',
          text: 'text-gray-800 dark:text-gray-300',
          icon: <FaInfoCircle size={24} />
        };
    }
  };

  const style = getSeverityStyle(severity);

  return (
    <div className={`${style.bg} border-l-4 ${style.border} rounded-lg p-5 shadow-lg mb-4 transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className={style.text}>
            {style.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`text-lg font-bold ${style.text}`}>{title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${style.text} uppercase`}>
                {severity}
              </span>
            </div>
            <p className={`${style.text} mb-3`}>{message}</p>
            
            {violatedRule && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Violated Guideline:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{violatedRule}</p>
              </div>
            )}

            {affectedMedication && (
              <div className="flex items-center space-x-2 mb-3">
                <FaPills className={style.text} />
                <span className={`text-sm font-semibold ${style.text}`}>
                  Affected: {affectedMedication}
                </span>
              </div>
            )}

            {recommendation && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                  <FaCheckCircle className="inline mr-2" />
                  Recommended Action:
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">{recommendation}</p>
              </div>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>

      {canOverride && onOverride && (
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={onOverride}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            Override with Clinical Justification
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            ⚠️ Override requires documentation and physician approval
          </p>
        </div>
      )}
    </div>
  );
};

// Main Safety Alert Section Page
const SafetyAlertPage = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'critical',
      title: 'Severe Drug-Allergy Interaction',
      message: 'Patient has documented allergy to Penicillin. Prescribed Amoxicillin is contraindicated.',
      violatedRule: 'GCR-001: Never prescribe medications from the same class as documented allergies',
      affectedMedication: 'Amoxicillin 500mg',
      recommendation: 'Consider alternative: Azithromycin 250mg or Ciprofloxacin 500mg',
      canOverride: false,
      dismissed: false
    },
    {
      id: 2,
      severity: 'high',
      title: 'Dangerous Drug Interaction',
      message: 'Concurrent use of Warfarin and NSAIDs significantly increases bleeding risk.',
      violatedRule: 'GCR-012: Avoid concurrent use of anticoagulants with NSAIDs',
      affectedMedication: 'Ibuprofen 400mg + Warfarin 5mg',
      recommendation: 'Replace Ibuprofen with Acetaminophen 500mg for pain management',
      canOverride: true,
      dismissed: false
    },
    {
      id: 3,
      severity: 'high',
      title: 'Renal Dosing Required',
      message: 'Patient\'s eGFR is 35 mL/min/1.73m² (Stage 3B CKD). Current Metformin dose exceeds safe limits.',
      violatedRule: 'GCR-034: Metformin contraindicated when eGFR < 30, use with caution when eGFR 30-45',
      affectedMedication: 'Metformin 1000mg twice daily',
      recommendation: 'Reduce Metformin to 500mg once daily, monitor renal function closely',
      canOverride: true,
      dismissed: false
    },
    {
      id: 4,
      severity: 'medium',
      title: 'Age-Related Dosing Concern',
      message: 'Patient is 78 years old. Standard adult dose may require adjustment for elderly.',
      violatedRule: 'GCR-045: Consider dose reduction for geriatric patients (>75 years)',
      affectedMedication: 'Zolpidem 10mg',
      recommendation: 'Reduce initial dose to 5mg for elderly patients to minimize fall risk',
      canOverride: true,
      dismissed: false
    },
    {
      id: 5,
      severity: 'medium',
      title: 'Duplicate Therapy Detected',
      message: 'Patient is already taking Lisinopril (ACE inhibitor). Adding Losartan (ARB) creates duplicate therapy.',
      violatedRule: 'GCR-023: Avoid combining ACE inhibitors with ARBs',
      affectedMedication: 'Losartan 50mg + Lisinopril 10mg',
      recommendation: 'Choose one agent. If inadequate BP control, add a different class (e.g., Amlodipine)',
      canOverride: true,
      dismissed: false
    },
    {
      id: 6,
      severity: 'low',
      title: 'Monitoring Recommendation',
      message: 'Patient started on statin therapy. Baseline liver function tests recommended.',
      violatedRule: 'GCR-067: Obtain baseline LFTs before initiating statin therapy',
      affectedMedication: 'Atorvastatin 20mg',
      recommendation: 'Order Comprehensive Metabolic Panel including LFTs',
      canOverride: false,
      dismissed: false
    },
    {
      id: 7,
      severity: 'low',
      title: 'Drug-Food Interaction',
      message: 'Levothyroxine absorption reduced when taken with food or calcium supplements.',
      violatedRule: 'GCR-089: Educate patients on proper administration timing',
      affectedMedication: 'Levothyroxine 100mcg',
      recommendation: 'Instruct patient to take on empty stomach, 30-60 minutes before breakfast',
      canOverride: false,
      dismissed: false
    }
  ]);

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleDismiss = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const handleOverride = (alert) => {
    setSelectedAlert(alert);
    setShowOverrideModal(true);
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const highCount = activeAlerts.filter(a => a.severity === 'high').length;
  const mediumCount = activeAlerts.filter(a => a.severity === 'medium').length;
  const lowCount = activeAlerts.filter(a => a.severity === 'low').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaExclamationTriangle className="mr-3 text-red-600" />
                Safety Alerts & GCR Violations
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Clinical decision support alerts based on guideline compliance rules
              </p>
            </div>
            <div className="flex space-x-3">
              <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">{criticalCount}</p>
                <p className="text-xs text-red-600 dark:text-red-400">Critical</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{highCount}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">High</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{mediumCount}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Medium</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{lowCount}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Low</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <FaAllergies className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Allergy Alerts</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <FaPills className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drug Interactions</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clinical Guidelines</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg p-8 text-center">
              <FaCheckCircle className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                No Active Safety Alerts
              </h3>
              <p className="text-green-700 dark:text-green-400">
                All prescriptions comply with clinical guidelines
              </p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <SafetyAlert
                key={alert.id}
                {...alert}
                onDismiss={() => handleDismiss(alert.id)}
                onOverride={alert.canOverride ? () => handleOverride(alert) : undefined}
              />
            ))
          )}
        </div>

        {/* Override Modal */}
        {showOverrideModal && selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Override Safety Alert
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You are about to override: <strong>{selectedAlert.title}</strong>
              </p>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  ⚠️ Overriding safety alerts requires clinical justification and will be logged for review.
                </p>
              </div>
              <textarea
                placeholder="Enter clinical justification for override..."
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              ></textarea>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDismiss(selectedAlert.id);
                    setShowOverrideModal(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Confirm Override
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { SafetyAlert };
export default SafetyAlertPage;
