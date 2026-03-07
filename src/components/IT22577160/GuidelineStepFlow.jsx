import React from 'react';
import { FaCheckCircle, FaCircle, FaClock, FaArrowRight } from 'react-icons/fa';

const GuidelineStepFlow = ({ steps, currentStep, onStepClick }) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-200 dark:ring-blue-900';
      case 'pending':
        return 'bg-gray-300 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600';
      default:
        return '';
    }
  };

  const getLineStyle = (stepIndex) => {
    if (stepIndex < currentStep) {
      return 'bg-green-500';
    }
    return 'bg-gray-300 dark:bg-gray-600';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle size={20} />;
      case 'current':
        return <FaClock size={20} />;
      case 'pending':
        return <FaCircle size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Desktop View - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => onStepClick && onStepClick(index)}
                  disabled={index > currentStep}
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${getStepStyle(
                    getStepStatus(index)
                  )} ${index <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                >
                  {getStepIcon(getStepStatus(index))}
                </button>
                <div className="mt-3 text-center max-w-[150px]">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    Step {index + 1}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {step.title}
                  </p>
                  {step.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.duration}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 relative" style={{ maxWidth: '150px' }}>
                  <div className={`h-full transition-all duration-500 ${getLineStyle(index)}`}></div>
                  <FaArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile View - Vertical */}
      <div className="md:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start">
              {/* Step Circle and Line */}
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => onStepClick && onStepClick(index)}
                  disabled={index > currentStep}
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${getStepStyle(
                    getStepStatus(index)
                  )} ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {getStepIcon(getStepStatus(index))}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-1 h-16 mt-2 transition-all duration-500 ${getLineStyle(index)}`}></div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-2">
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  Step {index + 1}: {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {step.description}
                  </p>
                )}
                {step.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Duration: {step.duration}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example usage component with detailed guideline steps
const GuidelineFlowPage = () => {
  const [currentStep, setCurrentStep] = React.useState(2);

  const treatmentSteps = [
    {
      title: 'Initial Assessment',
      description: 'Patient evaluation, vital signs, and medical history review',
      duration: 'Day 1',
      details: [
        'Complete physical examination',
        'Baseline vital signs measurement',
        'Review medical history and allergies',
        'Document current medications'
      ]
    },
    {
      title: 'Diagnostic Testing',
      description: 'Laboratory tests and imaging studies',
      duration: 'Days 1-3',
      details: [
        'Complete Blood Count (CBC)',
        'Comprehensive Metabolic Panel',
        'Lipid Panel',
        'HbA1c testing',
        'ECG if indicated'
      ]
    },
    {
      title: 'Diagnosis & Planning',
      description: 'Analyze results and develop treatment plan',
      duration: 'Day 3',
      details: [
        'Review all test results',
        'Confirm diagnosis',
        'Assess severity and risk factors',
        'Develop personalized treatment plan'
      ]
    },
    {
      title: 'Treatment Initiation',
      description: 'Begin medication and lifestyle interventions',
      duration: 'Week 1',
      details: [
        'Prescribe first-line medications',
        'Provide patient education',
        'Set lifestyle modification goals',
        'Schedule follow-up appointments'
      ]
    },
    {
      title: 'Monitoring',
      description: 'Track response and adjust treatment',
      duration: 'Weeks 2-4',
      details: [
        'Monitor for adverse effects',
        'Assess treatment response',
        'Adjust dosages if needed',
        'Address patient concerns'
      ]
    },
    {
      title: 'Optimization',
      description: 'Fine-tune treatment for optimal outcomes',
      duration: 'Weeks 4-12',
      details: [
        'Evaluate goal achievement',
        'Optimize medication regimen',
        'Reinforce lifestyle changes',
        'Plan long-term management'
      ]
    }
  ];

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      // Allow viewing previous steps
      console.log(`Viewing details for step ${stepIndex + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Treatment Guideline Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track progress through the evidence-based treatment protocol
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Current: Step {currentStep + 1} of {treatmentSteps.length}
              </span>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                {Math.round((currentStep / (treatmentSteps.length - 1)) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Guideline Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <GuidelineStepFlow 
            steps={treatmentSteps} 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
          />
        </div>

        {/* Current Step Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Current Step: {treatmentSteps[currentStep].title}
            </h2>
            <button
              onClick={() => setCurrentStep(Math.min(currentStep + 1, treatmentSteps.length - 1))}
              disabled={currentStep === treatmentSteps.length - 1}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
            >
              <span>Mark Complete & Continue</span>
              <FaArrowRight />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {treatmentSteps[currentStep].description}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              <FaClock className="inline mr-2" />
              Timeline: {treatmentSteps[currentStep].duration}
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Step Requirements:
          </h3>
          <ul className="space-y-2">
            {treatmentSteps[currentStep].details.map((detail, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{detail}</span>
              </li>
            ))}
          </ul>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
              disabled={currentStep === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              ← Previous Step
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(currentStep + 1, treatmentSteps.length - 1))}
              disabled={currentStep === treatmentSteps.length - 1}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GuidelineStepFlow };
export default GuidelineFlowPage;
