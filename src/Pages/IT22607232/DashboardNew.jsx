import { useState, useEffect } from 'react';
import { Button, Card, Label, TextInput, Textarea, Select } from 'flowbite-react';
import { HiClipboardList, HiChartBar, HiTrash, HiLightningBolt } from 'react-icons/hi';
import RiskDashboard from '../components/RiskDashboard';

export default function DashboardNew() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('auraFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
    return {
      age: '',
      gender: '',
      Weight: '',
      Height: '',
      'Diagnosed at the age of': '',
      IgE: '',
      CRP: '',
      FT4: '',
      VitD: '',
      'History of Chronic Urticaria': '',
      'Symptoms Of Urticaria': '',
      'Duration of Symptoms of urticaria': '',
      'Which time of the day do the symptoms occur?': '',
      'Family History of Urticaria': '',
      'Family history of thyroid diseases': '',
      'Family history of autoimmune diseases': '',
      symptoms_raw: '',
      investigations_raw: '',
      previous_treatments: '',
      medical_history: '',
      'If  angioedema is present': '',
      duration_days: '',
      urticaria_activity_score: ''
    };
  });

  const [patientData, setPatientData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    localStorage.setItem('auraFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearForm = () => {
    const emptyForm = {
      age: '',
      gender: '',
      Weight: '',
      Height: '',
      'Diagnosed at the age of': '',
      IgE: '',
      CRP: '',
      FT4: '',
      VitD: '',
      'History of Chronic Urticaria': '',
      'Symptoms Of Urticaria': '',
      'Duration of Symptoms of urticaria': '',
      'Which time of the day do the symptoms occur?': '',
      'Family History of Urticaria': '',
      'Family history of thyroid diseases': '',
      'Family history of autoimmune diseases': '',
      symptoms_raw: '',
      investigations_raw: '',
      previous_treatments: '',
      medical_history: '',
      'If  angioedema is present': '',
      duration_days: '',
      urticaria_activity_score: ''
    };
    setFormData(emptyForm);
    setPatientData(null);
    localStorage.removeItem('auraFormData');
  };

  const handleLoadSample = () => {
    const sampleData = {
      age: '24',
      gender: 'Female',
      Weight: '62',
      Height: '168',
      'Diagnosed at the age of': '23',
      IgE: '70',
      CRP: '1.0',
      FT4: '1.2',
      VitD: '28',
      'History of Chronic Urticaria': 'Yes',
      'Symptoms Of Urticaria': 'Wheals',
      'Duration of Symptoms of urticaria': 'More than 6 weeks',
      'Which time of the day do the symptoms occur?': 'Only after trigger',
      'Family History of Urticaria': 'No',
      'Family history of thyroid diseases': 'No',
      'Family history of autoimmune diseases': 'No',
      symptoms_raw: 'Severe itching, raised red welts on arms and torso, worsens at night',
      investigations_raw: 'Elevated IgE, positive skin prick test for dust mites',
      previous_treatments: 'Antihistamines (cetirizine 10mg), limited response',
      medical_history: 'Allergic rhinitis, no history of angioedema',
      'If  angioedema is present': 'No',
      duration_days: '45',
      urticaria_activity_score: '7'
    };
    setFormData(sampleData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert form data to model input format
    const modelInput = {};
    
    // Numeric fields
    if (formData.age) modelInput.Age = Number.parseFloat(formData.age);
    if (formData.Weight) modelInput.Weight = Number.parseFloat(formData.Weight);
    if (formData.Height) modelInput.Height = Number.parseFloat(formData.Height);
    if (formData['Diagnosed at the age of']) modelInput['Diagnosed at the age of'] = Number.parseFloat(formData['Diagnosed at the age of']);
    if (formData.IgE) modelInput.IgE = Number.parseFloat(formData.IgE);
    if (formData.duration_days) modelInput.duration_days = Number.parseFloat(formData.duration_days);
    if (formData.urticaria_activity_score) modelInput.urticaria_activity_score = Number.parseFloat(formData.urticaria_activity_score);
    if (formData.CRP) modelInput.CRP = Number.parseFloat(formData.CRP);
    if (formData.FT4) modelInput.FT4 = Number.parseFloat(formData.FT4);
    if (formData.VitD) modelInput.VitD = Number.parseFloat(formData.VitD);
    
    // Categorical/Text fields
    if (formData.gender) modelInput.gender = formData.gender;
    if (formData['History of Chronic Urticaria']) modelInput['History of Chronic Urticaria'] = formData['History of Chronic Urticaria'];
    if (formData['Symptoms Of Urticaria']) modelInput['Symptoms Of Urticaria'] = formData['Symptoms Of Urticaria'];
    if (formData['Duration of Symptoms of urticaria']) modelInput['Duration of Symptoms of urticaria'] = formData['Duration of Symptoms of urticaria'];
    if (formData['Which time of the day do the symptoms occur?']) modelInput['Which time of the day do the symptoms occur?'] = formData['Which time of the day do the symptoms occur?'];
    if (formData['Family History of Urticaria']) modelInput['Family History of Urticaria'] = formData['Family History of Urticaria'];
    if (formData['Family history of thyroid diseases']) modelInput['Family history of thyroid diseases'] = formData['Family history of thyroid diseases'];
    if (formData['Family history of autoimmune diseases']) modelInput['Family history of autoimmune diseases'] = formData['Family history of autoimmune diseases']
    
    // Numeric fields
    if (formData.age) modelInput.age = Number.parseFloat(formData.age);
    if (formData.IgE) modelInput.IgE = Number.parseFloat(formData.IgE);
    if (formData.duration_days) modelInput.duration_days = Number.parseFloat(formData.duration_days);
    if (formData.urticaria_activity_score) modelInput.urticaria_activity_score = Number.parseFloat(formData.urticaria_activity_score);
    if (formData.CRP) modelInput.CRP = Number.parseFloat(formData.CRP);
    
    // Categorical/Text fields
    if (formData.gender) modelInput.gender = formData.gender;
    if (formData.symptoms_raw) modelInput.symptoms_raw = formData.symptoms_raw;
    if (formData.investigations_raw) modelInput.investigations_raw = formData.investigations_raw;
    if (formData.previous_treatments) modelInput.previous_treatments = formData.previous_treatments;
    if (formData.medical_history) modelInput.medical_history = formData.medical_history;
    if (formData['If  angioedema is present']) modelInput['If  angioedema is present'] = formData['If  angioedema is present'];

    setPatientData(modelInput);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400">
              AURA
            </span>{' '}
            <span className="text-gray-900 dark:text-white">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            AI-Powered Urticaria Risk Assessment System
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            color={!showResults ? 'cyan' : 'gray'}
            size="lg"
            onClick={() => setShowResults(false)}
            className={!showResults ? 'bg-gradient-to-r from-cyan-600 to-teal-600' : ''}
          >
            <HiClipboardList className="mr-2 h-5 w-5" />
            Patient Input
          </Button>
          <Button
            color={showResults ? 'cyan' : 'gray'}
            size="lg"
            onClick={() => setShowResults(true)}
            className={showResults ? 'bg-gradient-to-r from-cyan-600 to-teal-600' : ''}
            disabled={!patientData}
          >
            <HiChartBar className="mr-2 h-5 w-5" />
            Risk Assessment
          </Button>
        </div>

        {/* Input Form */}
        {!showResults && (
          <Card>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Information</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enter clinical data for risk assessment</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    color="purple"
                    size="sm"
                    onClick={handleLoadSample}
                  >
                    <HiLightningBolt className="mr-2 h-4 w-4" />
                    Load Sample
                  </Button>
                  <Button
                    color="gray"
                    size="sm"
                    onClick={handleClearForm}
                  >
                    <HiTrash className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Demographics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    📋 Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="age" value="Age" />
                      <TextInput
                        id="age"
                        name="age"
                        type="number"
                        placeholder="e.g., 24"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" value="Gender" />
                      <Select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="Weight" value="Weight (kg)" />
                      <TextInput
                        id="Weight"
                        name="Weight"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 62"
                        value={formData.Weight}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="Height" value="Height (cm)" />
                      <TextInput
                        id="Height"
                        name="Height"
                        type="number"
                        placeholder="e.g., 168"
                        value={formData.Height}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Urticaria History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    🏥 Urticaria History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="Diagnosed at the age of" value="Diagnosed at Age" />
                      <TextInput
                        id="Diagnosed at the age of"
                        name="Diagnosed at the age of"
                        type="number"
                        placeholder="e.g., 23"
                        value={formData['Diagnosed at the age of']}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="History of Chronic Urticaria" value="History of Chronic Urticaria" />
                      <Select
                        id="History of Chronic Urticaria"
                        name="History of Chronic Urticaria"
                        value={formData['History of Chronic Urticaria']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="Symptoms Of Urticaria" value="Symptoms Of Urticaria" />
                      <Select
                        id="Symptoms Of Urticaria"
                        name="Symptoms Of Urticaria"
                        value={formData['Symptoms Of Urticaria']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Wheals">Wheals</option>
                        <option value="Angioedema">Angioedema</option>
                        <option value="Both">Both</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="Duration of Symptoms of urticaria" value="Duration of Symptoms" />
                      <Select
                        id="Duration of Symptoms of urticaria"
                        name="Duration of Symptoms of urticaria"
                        value={formData['Duration of Symptoms of urticaria']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Less than 6 weeks">Less than 6 weeks</option>
                        <option value="More than 6 weeks">More than 6 weeks</option>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="Which time of the day do the symptoms occur?" value="When do symptoms occur?" />
                      <Select
                        id="Which time of the day do the symptoms occur?"
                        name="Which time of the day do the symptoms occur?"
                        value={formData['Which time of the day do the symptoms occur?']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                        <option value="Only after trigger">Only after trigger</option>
                        <option value="All day">All day</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Family History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    👨‍👩‍👧‍👦 Family History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="Family History of Urticaria" value="Urticaria in Family" />
                      <Select
                        id="Family History of Urticaria"
                        name="Family History of Urticaria"
                        value={formData['Family History of Urticaria']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="Family history of thyroid diseases" value="Thyroid Diseases in Family" />
                      <Select
                        id="Family history of thyroid diseases"
                        name="Family history of thyroid diseases"
                        value={formData['Family history of thyroid diseases']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="Family history of autoimmune diseases" value="Autoimmune Diseases in Family" />
                      <Select
                        id="Family history of autoimmune diseases"
                        name="Family history of autoimmune diseases"
                        value={formData['Family history of autoimmune diseases']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Lab Results */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    🧪 Laboratory Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="CRP" value="CRP (mg/L)" />
                      <TextInput
                        id="CRP"
                        name="CRP"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1.0"
                        value={formData.CRP}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="IgE" value="IgE (IU/mL)" />
                      <TextInput
                        id="IgE"
                        name="IgE"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 70"
                        value={formData.IgE}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="FT4" value="FT4 (ng/dL)" />
                      <TextInput
                        id="FT4"
                        name="FT4"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1.2"
                        value={formData.FT4}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="VitD" value="Vitamin D (ng/mL)" />
                      <TextInput
                        id="VitD"
                        name="VitD"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 28"
                        value={formData.VitD}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Assessment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    🩺 Clinical Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="urticaria_activity_score" value="Urticaria Activity Score (0-10)" />
                      <TextInput
                        id="urticaria_activity_score"
                        name="urticaria_activity_score"
                        type="number"
                        min="0"
                        max="10"
                        placeholder="e.g., 7"
                        value={formData.urticaria_activity_score}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="If  angioedema is present" value="Angioedema Present?" />
                      <Select
                        id="If  angioedema is present"
                        name="If  angioedema is present"
                        value={formData['If  angioedema is present']}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 border-cyan-200 dark:border-cyan-800">
                    📝 Clinical Notes
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="symptoms_raw" value="Symptoms Description (Optional)" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        What does the patient experience? (itching intensity, rash appearance, swelling location, timing)
                      </p>
                      <Textarea
                        id="symptoms_raw"
                        name="symptoms_raw"
                        placeholder="Example: Severe itching with raised red welts on arms and torso, worse at night and after hot showers"
                        rows={2}
                        value={formData.symptoms_raw}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="investigations_raw" value="Investigation Results (Optional)" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Any tests performed? (blood work findings, allergy tests, imaging)
                      </p>
                      <Textarea
                        id="investigations_raw"
                        name="investigations_raw"
                        placeholder="Example: Elevated IgE levels, positive skin prick test for dust mites"
                        rows={2}
                        value={formData.investigations_raw}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="previous_treatments" value="Previous Treatments (Optional)" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        What medications or therapies were tried? What was the result?
                      </p>
                      <Textarea
                        id="previous_treatments"
                        name="previous_treatments"
                        placeholder="Example: Cetirizine 10mg daily for 3 weeks - minimal improvement. Tried avoiding dairy - no change"
                        rows={2}
                        value={formData.previous_treatments}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medical_history" value="Relevant Medical History (Optional)" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Other health conditions, allergies, or family history relevant to this case
                      </p>
                      <Textarea
                        id="medical_history"
                        name="medical_history"
                        placeholder="Example: Has asthma and seasonal allergies. Mother has autoimmune thyroid disease. No food allergies known"
                        rows={2}
                        value={formData.medical_history}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                  >
                    <HiChartBar className="mr-2 h-5 w-5" />
                    Generate Risk Assessment
                  </Button>
                </div>
              </form>
            </Card>
        )}

        {/* Results Display */}
        {showResults && (
          <RiskDashboard patientData={patientData} />
        )}
      </div>
    </div>
  );
}
