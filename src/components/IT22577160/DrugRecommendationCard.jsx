import React from 'react';
import { FaPills, FaCalendar , FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaClock, FaWeight, FaSyringe } from 'react-icons/fa';

const DrugRecommendationCard = ({ 
  drugName, 
  genericName,
  dosage, 
  frequency, 
  duration,
  route,
  rationale, 
  confidence,
  contraindications = [],
  interactions = [],
  sideEffects = [],
  alternatives = [],
  status = 'recommended' // 'recommended', 'approved', 'rejected'
}) => {
  const getConfidenceColor = (level) => {
    if (level >= 90) return 'text-green-600 bg-green-100';
    if (level >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'rejected':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-600" size={24} />;
      case 'rejected':
        return <FaExclamationTriangle className="text-red-600" size={24} />;
      default:
        return <FaInfoCircle className="text-blue-600" size={24} />;
    }
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 border-l-4 transition-all hover:shadow-xl ${getStatusStyle(status)}`}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg text-white">
            <FaPills size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{drugName}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{genericName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(confidence)}`}>
            {confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Dosage Information Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
            <FaWeight size={14} />
            <span className="text-xs font-semibold">DOSAGE</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{dosage}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
            <FaClock size={14} />
            <span className="text-xs font-semibold">FREQUENCY</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{frequency}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
            <FaCalendar size={14} />
            <span className="text-xs font-semibold">DURATION</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{duration}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
            <FaSyringe size={14} />
            <span className="text-xs font-semibold">ROUTE</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{route}</p>
        </div>
      </div>

      {/* AI Rationale */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-lg mb-4">
        <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <FaInfoCircle className="mr-2 text-blue-600" />
          AI Recommendation Rationale
        </h4>
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{rationale}</p>
      </div>

      {/* Warnings and Interactions */}
      {(contraindications.length > 0 || interactions.length > 0) && (
        <div className="space-y-3 mb-4">
          {contraindications.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <h5 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Contraindications
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {contraindications.map((item, idx) => (
                  <li key={idx} className="text-red-700 dark:text-red-300 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {interactions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <h5 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Drug Interactions
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {interactions.map((item, idx) => (
                  <li key={idx} className="text-yellow-700 dark:text-yellow-300 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Side Effects */}
      {sideEffects.length > 0 && (
        <div className="mb-4">
          <h5 className="font-bold text-gray-800 dark:text-white mb-2">Common Side Effects</h5>
          <div className="flex flex-wrap gap-2">
            {sideEffects.map((effect, idx) => (
              <span key={idx} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Options */}
      {alternatives.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h5 className="font-bold text-gray-800 dark:text-white mb-2">Alternative Options</h5>
          <div className="space-y-2">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-white">{alt.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{alt.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {status === 'recommended' && (
        <div className="flex space-x-3 mt-6">
          <button className="group relative flex-1 inline-flex items-center justify-center space-x-2 py-3 text-base font-bold text-white transition-all duration-500 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg hover:shadow-green-500/50 hover:scale-105 overflow-hidden">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-96 group-hover:h-96 opacity-10"></span>
            <FaCheckCircle className="relative z-10" />
            <span className="relative z-10">Approve Recommendation</span>
          </button>
          <button className="group relative flex-1 inline-flex items-center justify-center space-x-2 py-3 text-base font-bold text-white transition-all duration-500 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-lg hover:shadow-red-500/50 hover:scale-105 overflow-hidden">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-96 group-hover:h-96 opacity-10"></span>
            <FaExclamationTriangle className="relative z-10" />
            <span className="relative z-10">Reject</span>
          </button>
        </div>
      )}

      {status === 'approved' && (
        <div className="mt-6 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-3 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-semibold text-center">
            ✓ This recommendation has been approved and added to the treatment plan
          </p>
        </div>
      )}

      {status === 'rejected' && (
        <div className="mt-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 rounded-lg">
          <p className="text-red-800 dark:text-red-300 font-semibold text-center">
            ✗ This recommendation has been rejected by the physician
          </p>
        </div>
      )}
    </div>
  );
};

// Example usage component
const DrugRecommendationPage = () => {
  const sampleRecommendations = [
    {
      drugName: 'Lisinopril',
      genericName: 'ACE Inhibitor',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '90 days',
      route: 'Oral',
      rationale: 'Based on the patient\'s blood pressure readings (average 145/95 mmHg over the last 3 visits) and diagnosis of Stage 2 Hypertension, Lisinopril is recommended as first-line therapy. The patient has no contraindications and shows good renal function (eGFR: 85 mL/min/1.73m²).',
      confidence: 94,
      contraindications: [],
      interactions: ['NSAIDs may reduce effectiveness', 'Potassium supplements may cause hyperkalemia'],
      sideEffects: ['Dry cough', 'Dizziness', 'Headache', 'Fatigue'],
      alternatives: [
        { name: 'Losartan 50mg', reason: 'Alternative if ACE inhibitor cough develops' },
        { name: 'Amlodipine 5mg', reason: 'Calcium channel blocker alternative' }
      ],
      status: 'recommended'
    },
    {
      drugName: 'Metformin',
      genericName: 'Biguanide',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: 'Ongoing',
      route: 'Oral',
      rationale: 'Patient\'s HbA1c is 7.8% with fasting glucose of 145 mg/dL. Metformin is the recommended first-line therapy for Type 2 Diabetes. Starting with a lower dose to minimize GI side effects, with planned titration to 1000mg twice daily.',
      confidence: 96,
      contraindications: [],
      interactions: ['Contrast dye - temporary discontinuation required'],
      sideEffects: ['Nausea', 'Diarrhea', 'Abdominal discomfort', 'Metallic taste'],
      alternatives: [
        { name: 'Empagliflozin 10mg', reason: 'SGLT2 inhibitor if GI intolerance' }
      ],
      status: 'approved'
    },
    {
      drugName: 'Warfarin',
      genericName: 'Anticoagulant',
      dosage: '5mg',
      frequency: 'Once daily',
      duration: 'Ongoing',
      route: 'Oral',
      rationale: 'Patient with newly diagnosed atrial fibrillation and CHA2DS2-VASc score of 4.',
      confidence: 72,
      contraindications: ['Patient has a history of GI bleeding'],
      interactions: ['Multiple drug interactions require monitoring'],
      sideEffects: ['Bleeding', 'Bruising'],
      alternatives: [
        { name: 'Apixaban 5mg', reason: 'Direct oral anticoagulant with lower bleeding risk' }
      ],
      status: 'rejected'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI Drug Recommendations</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review AI-generated medication recommendations based on patient data and clinical guidelines
          </p>
        </div>

        <div className="space-y-6">
          {sampleRecommendations.map((rec, idx) => (
            <DrugRecommendationCard key={idx} {...rec} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { DrugRecommendationCard };
export default DrugRecommendationPage;
