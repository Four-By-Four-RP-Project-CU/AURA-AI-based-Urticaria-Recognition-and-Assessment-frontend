import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FaMicroscope, FaFlask, FaUser, FaHeartbeat, FaFilePdf,
  FaChevronDown, FaChevronUp, FaArrowLeft, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaImage, FaCog,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { callAnalyze, callExtractLabs, callReportPdf } from '../../api/aura';

// ── Display metadata ──────────────────────────────────────────────────────────
const DRUG_META = {
  H1_ANTIHISTAMINE: {
    label: 'H1 Antihistamine',
    textClass: 'text-sky-700 dark:text-sky-300',
    lightBg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-500',
    barFill: '#0ea5e9',
    desc: 'Standard or up-dosed 2nd-generation non-sedating H1 antihistamine — first-line therapy for all CSU patients.',
  },
  LTRA: {
    label: 'LTRA',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-500',
    barFill: '#10b981',
    desc: 'Leukotriene Receptor Antagonist — adjunct to antihistamine therapy, especially for NSAID-sensitive patients.',
  },
  ADVANCED_THERAPY: {
    label: 'Advanced Therapy',
    textClass: 'text-violet-700 dark:text-violet-300',
    lightBg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-500',
    barFill: '#8b5cf6',
    desc: 'Omalizumab (anti-IgE biologic, 300 mg s.c. q4w) or ciclosporin — third-line for refractory CSU.',
  },
  OTHER: {
    label: 'Other Therapy',
    textClass: 'text-amber-700 dark:text-amber-300',
    lightBg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500',
    barFill: '#f59e0b',
    desc: 'Alternative, supportive, or combination therapy approach.',
  },
};

const STEP_META = {
  STEP_1: { label: 'Step 1', colorClass: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', textClass: 'text-emerald-800 dark:text-emerald-300', text: 'Standard-dose 2nd-gen H1-antihistamine' },
  STEP_2: { label: 'Step 2', colorClass: 'bg-yellow-500', lightBg: 'bg-yellow-50 dark:bg-yellow-900/20', textClass: 'text-yellow-800 dark:text-yellow-300', text: 'Up-dosed H1-AH (up to 4×)' },
  STEP_3: { label: 'Step 3', colorClass: 'bg-orange-500', lightBg: 'bg-orange-50 dark:bg-orange-900/20', textClass: 'text-orange-800 dark:text-orange-300', text: 'Add omalizumab (anti-IgE biologic)' },
  STEP_4: { label: 'Step 4', colorClass: 'bg-red-600',    lightBg: 'bg-red-50 dark:bg-red-900/20',    textClass: 'text-red-800 dark:text-red-300',    text: 'Ciclosporin / advanced immunosuppressant' },
};

const SEV_COLOR = { none: '#10b981', minimal: '#22c55e', mild: '#eab308', moderate: '#f97316', severe: '#ef4444', unknown: '#9ca3af' };
const GATE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

// ── Reusable sub-components ───────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, iconColor = 'text-blue-600', children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4">
      <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center mb-4">
        {Icon && <Icon className={`mr-2 ${iconColor}`} />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldLabel({ label, unit, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
      {label}
      {unit && <span className="font-normal normal-case ml-1 text-gray-400">({unit})</span>}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}

function NumberInput({ value, onChange, min, max, step = 'any', placeholder }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder || '—'}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}

function Collapsible({ title, icon: Icon, badge, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-semibold text-gray-800 dark:text-white flex items-center text-sm">
          {Icon && <Icon className="mr-2 text-gray-500" />}
          {title}
          {badge && <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-normal text-gray-500">optional</span>}
        </span>
        {open ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4">{children}</div>}
    </div>
  );
}

function ConfidenceBar({ value, abstain }) {
  const pct = Math.round(value * 100);
  const barClass = abstain || value < 0.55 ? 'bg-red-400' : value < 0.75 ? 'bg-yellow-400' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-gray-500 dark:text-gray-400">Model Confidence</span>
        <span className={abstain ? 'text-red-600' : 'text-gray-800 dark:text-white'}>
          {pct}%{abstain ? ' — Low (manual review required)' : ''}
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AnalyzePage = () => {
  const [phase, setPhase] = useState('form'); // 'form' | 'loading' | 'results'
  const [result, setResult] = useState(null);

  // Patient
  const [caseId, setCaseId] = useState('');
  const [patientName, setPatientName] = useState('');

  // Files
  const [skinImage, setSkinImage] = useState(null);
  const [skinPreview, setSkinPreview] = useState(null);
  const [labReports, setLabReports] = useState([]);

  // Lab values
  const [labs, setLabs] = useState({ CRP: '', FT4: '', IgE: '', VitD: '', Age: '' });

  // Clinical
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [itchingScore, setItchingScore] = useState('');
  const [ageFirstSymptoms, setAgeFirstSymptoms] = useState('');
  const [diagnosedAge, setDiagnosedAge] = useState('');

  // UAS7
  const [uas7, setUas7] = useState('');
  const [dailyWheal, setDailyWheal] = useState('');
  const [dailyPruritus, setDailyPruritus] = useState('');

  // Advanced
  const [abstainThreshold, setAbstainThreshold] = useState(0.55);

  const [labAnalyzing, setLabAnalyzing] = useState(false);

  const skinInputRef = useRef();
  const labInputRef = useRef();

  const handleExtractLabs = async () => {
    if (!labReports.length) return;
    setLabAnalyzing(true);
    try {
      const fd = new FormData();
      labReports.forEach(f => fd.append('lab_reports', f));
      const data = await callExtractLabs(fd);
      const ex = data.extracted || {};
      setLabs(prev => ({
        CRP:  ex.CRP  != null ? String(ex.CRP)  : prev.CRP,
        FT4:  ex.FT4  != null ? String(ex.FT4)  : prev.FT4,
        IgE:  ex.IgE  != null ? String(ex.IgE)  : prev.IgE,
        VitD: ex.VitD != null ? String(ex.VitD) : prev.VitD,
        Age:  ex.Age  != null ? String(ex.Age)  : prev.Age,
      }));
      if (data.warnings && data.warnings.length) {
        data.warnings.forEach(w => toast.warn(w));
      } else {
        toast.success('Lab values extracted — review below before running analysis.');
      }
    } catch (err) {
      toast.error(err.message || 'Lab extraction failed. Please try again.');
    } finally {
      setLabAnalyzing(false);
    }
  };

  const handleSkinFile = file => {
    if (!file) return;
    setSkinImage(file);
    const reader = new FileReader();
    reader.onload = e => setSkinPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('skin_image', skinImage);
    labReports.forEach(f => fd.append('lab_reports', f));
    if (caseId.trim())       fd.append('case_id', caseId.trim());
    if (patientName.trim())  fd.append('patient_name', patientName.trim());
    if (labs.CRP)  fd.append('CRP',  labs.CRP);
    if (labs.FT4)  fd.append('FT4',  labs.FT4);
    if (labs.IgE)  fd.append('IgE',  labs.IgE);
    if (labs.VitD) fd.append('VitD', labs.VitD);
    if (labs.Age)  fd.append('Age',  labs.Age);
    if (weight)            fd.append('Weight',                         weight);
    if (height)            fd.append('Height',                         height);
    if (itchingScore)      fd.append('Itching_score',                  itchingScore);
    if (ageFirstSymptoms)  fd.append('Age_experienced_first_symptoms', ageFirstSymptoms);
    if (diagnosedAge)      fd.append('Diagnosed_at_the_age_of',        diagnosedAge);
    if (uas7)              fd.append('UAS7',                           uas7);
    if (dailyWheal)        fd.append('daily_wheal_avg',                dailyWheal);
    if (dailyPruritus)     fd.append('daily_pruritus_avg',             dailyPruritus);
    fd.append('abstain_threshold', abstainThreshold);
    return fd;
  };

  const handleAnalyze = async () => {
    if (!skinImage) {
      toast.error('A skin photograph is required.');
      return;
    }
    setPhase('loading');
    try {
      const data = await callAnalyze(buildFormData());
      setResult(data);
      localStorage.setItem('aura_last_result', JSON.stringify({
        ...data,
        _ts: new Date().toISOString(),
        _patientName: patientName || 'Anonymous',
        _caseId: caseId || '—',
      }));
      setPhase('results');
    } catch (err) {
      setPhase('form');
      const detail = err?.body?.detail;
      if (detail?.error === 'non_csu_image') {
        const distScore = detail.ood_z != null ? detail.ood_z.toFixed(4) : '?';
        toast.error(
          `Image rejected — does not appear to be a CSU skin photograph ` +
          `(prototype distance ${distScore}, threshold 0.7418). ` +
          'Please upload a clear, close-up photo of the affected skin area.',
          { autoClose: 10000 }
        );
      } else {
        toast.error(err.message || 'Analysis failed. Please try again.');
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (!skinImage) return;
    const tid = toast.loading('Generating PDF report…');
    try {
      const fd = buildFormData();
      // Pass the already-computed result so the PDF backend skips re-inference,
      // guaranteeing the PDF shows exactly what the dashboard shows.
      if (result) fd.append('cached_result', JSON.stringify(result));
      const { blob, filename } = await callReportPdf(fd);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.update(tid, { render: 'PDF downloaded!', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(tid, { render: err.message || 'PDF failed.', type: 'error', isLoading: false, autoClose: 5000 });
    }
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  if (phase === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl text-white shadow-lg">
                <FaMicroscope size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">AURA — CSU Analysis</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered Chronic Spontaneous Urticaria recommendation system</p>
              </div>
            </div>
          </div>

          {/* 1 — Patient Info */}
          {/* <SectionCard title="Patient Information" icon={FaUser} iconColor="text-blue-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Case ID" />
                <TextInput value={caseId} onChange={setCaseId} placeholder="Auto-generated if blank" />
              </div>
              <div>
                <FieldLabel label="Patient Name / Label" />
                <TextInput value={patientName} onChange={setPatientName} placeholder="Anonymous" />
              </div>
            </div>
          </SectionCard> */}

          {/* 2 — Image Uploads */}
          <SectionCard title="Image Uploads" icon={FaImage} iconColor="text-indigo-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skin photo */}
              <div>
                <FieldLabel label="CSU Skin Photograph" required />
                <div
                  onClick={() => skinInputRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleSkinFile(e.dataTransfer.files[0]); }}
                  className="relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[10rem] flex flex-col items-center justify-center"
                >
                  {skinPreview ? (
                    <>
                      <img src={skinPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setSkinImage(null); setSkinPreview(null); }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 text-xs shadow"
                      ><FaTimes /></button>
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-full">{skinImage.name}</p>
                    </>
                  ) : (
                    <>
                      <FaImage className="text-4xl text-blue-300 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Drop skin photo here or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">JPG / PNG — required for analysis</p>
                    </>
                  )}
                </div>
                <input ref={skinInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleSkinFile(e.target.files[0])} />
              </div>

              {/* Lab reports */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel label="Lab Report Image(s)" unit="optional — OCR extracts CRP / FT4 / IgE / VitD" />
                  <button
                    type="button"
                    onClick={handleExtractLabs}
                    disabled={!labReports.length || labAnalyzing}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:shadow-purple-400/40 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  >
                    {labAnalyzing ? (
                      <>
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Extracting…
                      </>
                    ) : (
                      <><FaFlask size={11} /> Analyse Lab Report</>
                    )}
                  </button>
                </div>
                <div
                  onClick={() => labInputRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setLabReports(p => [...p, ...Array.from(e.dataTransfer.files)]); }}
                  className="border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors min-h-[10rem]"
                >
                  <FaFlask className="mx-auto text-4xl text-purple-300 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drop lab report images or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPG / PNG / PDF — multiple files allowed</p>
                  {labReports.length > 0 && (
                    <div className="mt-3 text-left space-y-1">
                      {labReports.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 rounded px-2 py-1">
                          <span className="text-xs text-purple-700 dark:text-purple-300 truncate">{f.name}</span>
                          <button type="button" onClick={e => { e.stopPropagation(); setLabReports(p => p.filter((_, j) => j !== i)); }} className="ml-2 text-red-400 hover:text-red-600 text-xs"><FaTimes /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input ref={labInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={e => setLabReports(p => [...p, ...Array.from(e.target.files)])} />
              </div>
            </div>
          </SectionCard>

          {/* 3 — Lab Values */}
          <SectionCard title="Laboratory Values" icon={FaFlask} iconColor="text-purple-600">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 mb-4 text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-2">
              <FaInfoCircle className="flex-shrink-0 mt-0.5" />
              <span>Values entered here override OCR extraction from lab report images. Leave blank to use OCR or training-set mean fallback.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'CRP',  label: 'CRP',  unit: 'mg/L',   min: 0, max: 100,  hint: 'Normal &lt; 5' },
                { key: 'FT4',  label: 'FT4',  unit: 'ng/dL',  min: 0, max: 5,    hint: '0.8–1.8 normal', step: '0.01' },
                { key: 'IgE',  label: 'IgE',  unit: 'IU/mL',  min: 0, max: 2000, hint: '&lt; 100 non-atopic' },
                { key: 'VitD', label: 'VitD', unit: 'ng/mL',  min: 0, max: 150,  hint: '30–50 sufficient' },
                { key: 'Age',  label: 'Age',  unit: 'years',  min: 0, max: 120,  hint: '18–75 in training' },
              ].map(({ key, label, unit, min, max, hint, step }) => (
                <div key={key}>
                  <FieldLabel label={label} unit={unit} />
                  <NumberInput
                    value={labs[key]}
                    onChange={v => setLabs(p => ({ ...p, [key]: v }))}
                    min={min} max={max} step={step}
                    placeholder="—"
                  />
                  <p className="text-xs text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: hint }} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 4 — Clinical Symptoms */}
          <Collapsible title="Clinical Symptoms" icon={FaHeartbeat} badge>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Weight', unit: 'kg', value: weight, set: setWeight, min: 30, max: 200 },
                { label: 'Height', unit: 'cm', value: height, set: setHeight, min: 100, max: 220 },
                { label: 'Itching Score', unit: '0–6 NRS', value: itchingScore, set: setItchingScore, min: 0, max: 6 },
                { label: 'Age at First Symptoms', unit: 'years', value: ageFirstSymptoms, set: setAgeFirstSymptoms, min: 0, max: 100 },
                { label: 'Age at Diagnosis', unit: 'years', value: diagnosedAge, set: setDiagnosedAge, min: 0, max: 100 },
              ].map(({ label, unit, value, set, min, max }) => (
                <div key={label}>
                  <FieldLabel label={label} unit={unit} />
                  <NumberInput value={value} onChange={set} min={min} max={max} />
                </div>
              ))}
            </div>
          </Collapsible>

          {/* 5 — UAS7 */}
          <Collapsible title="Urticaria Activity Score — UAS7" icon={FaHeartbeat} badge>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Provide the total UAS7 (0–42) <strong>or</strong> 7-day daily averages. Used for severity classification and step alignment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'UAS7 Total', unit: '0–42', value: uas7, set: setUas7, min: 0, max: 42, ph: 'e.g. 18' },
                { label: 'Daily Wheal Avg', unit: '0–3/day', value: dailyWheal, set: setDailyWheal, min: 0, max: 3, step: '0.1' },
                { label: 'Daily Pruritus Avg', unit: '0–3/day', value: dailyPruritus, set: setDailyPruritus, min: 0, max: 3, step: '0.1' },
              ].map(({ label, unit, value, set, min, max, step, ph }) => (
                <div key={label}>
                  <FieldLabel label={label} unit={unit} />
                  <NumberInput value={value} onChange={set} min={min} max={max} step={step} placeholder={ph} />
                </div>
              ))}
            </div>
          </Collapsible>

          {/* 6 — Advanced */}
          <Collapsible title="Advanced Settings" icon={FaCog}>
            <div className="max-w-xs">
              <FieldLabel label="Abstain Threshold" unit="confidence below this → low-confidence flag" />
              <NumberInput value={abstainThreshold} onChange={v => setAbstainThreshold(+v)} min={0.3} max={0.99} step="0.01" />
              <p className="text-xs text-gray-400 mt-1">Default 0.55 — recommended for clinical use</p>
            </div>
          </Collapsible>

          {/* Submit row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start space-x-1">
              <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Only the skin photograph is required. Providing lab values significantly improves accuracy.</span>
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!skinImage}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 whitespace-nowrap"
            >
              <FaMicroscope />
              <span>Run AURA Analysis</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600" />
            <FaMicroscope className="absolute inset-0 m-auto text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Analysing…</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Running GC-MuPeN v3 · EfficientNet-B3 · Grad-CAM · CU characteristics
          </p>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  const drug = result?.predicted_drug_group || 'OTHER';
  const dm = DRUG_META[drug] || DRUG_META.OTHER;
  const stepKey = result?.mapped_guideline_step || 'STEP_1';
  const sm = STEP_META[stepKey] || STEP_META.STEP_1;
  const stepDetail = result?.guideline_step_detail || {};
  const top3 = (result?.top3 || []).map(([name, conf]) => ({
    name: (DRUG_META[name]?.label || name).replace('Antihistamine', 'H1-AH'),
    value: conf,
    fill: DRUG_META[name]?.barFill || '#9ca3af',
  }));
  const gateWeights = result?.modality_gate_weights || [0.34, 0.33, 0.33];
  const gateData = [
    { name: 'Image',    value: +(gateWeights[0] || 0).toFixed(3) },
    { name: 'Lab',      value: +(gateWeights[1] || 0).toFixed(3) },
    { name: 'Clinical', value: +(gateWeights[2] || 0).toFixed(3) },
  ];
  const uas7Interp = result?.uas7_interpretation;
  const cuChars = result?.cu_characteristics;
  const align = result?.guideline_step_alignment;
  const labsUsed = result?.used_features || {};

  const alignLabel = {
    aligned: { text: '✓ Aligned with UAS7 severity', cls: 'text-emerald-600 dark:text-emerald-400' },
    model_higher: { text: '↑ Model recommends higher step than UAS7', cls: 'text-amber-600 dark:text-amber-400' },
    model_lower:  { text: '↓ Model recommends lower step than UAS7',  cls: 'text-sky-600 dark:text-sky-400' },
  }[align] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Results header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-5 gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white flex items-center">
              <FaCheckCircle className="mr-2 text-emerald-500" />
              Analysis Complete
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {caseId && <span className="mr-3">Case: <strong className="text-gray-700 dark:text-gray-300">{caseId}</strong></span>}
              {patientName && <span className="mr-3">Patient: <strong className="text-gray-700 dark:text-gray-300">{patientName}</strong></span>}
              <span>{new Date().toLocaleString()}</span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => { setResult(null); setPhase('form'); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <FaArrowLeft size={12} /><span>New Analysis</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg text-sm font-bold shadow hover:shadow-blue-400/40 hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <FaFilePdf /><span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {result?.abstain && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-4 flex items-start space-x-3">
            <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Low Confidence — Clinical Review Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Model confidence ({Math.round(result.confidence * 100)}%) is below the {Math.round(abstainThreshold * 100)}% threshold. Do not act on this recommendation without physician review.
              </p>
            </div>
          </div>
        )}
        {(result?.notes || []).map((note, i) => (
          <div key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 mb-3 text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-2">
            <FaInfoCircle className="flex-shrink-0 mt-0.5" /><span>{note}</span>
          </div>
        ))}

        {/* ── Prediction row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Drug card */}
          <div className={`md:col-span-2 ${dm.lightBg} border-l-4 ${dm.border} rounded-xl p-6 shadow-md`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Predicted Drug Class</p>
            <h2 className={`text-3xl font-extrabold ${dm.textClass} mb-1`}>{dm.label}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{dm.desc}</p>
            <ConfidenceBar value={result.confidence} abstain={result.abstain} />
          </div>

          {/* Step card */}
          <div className={`${sm.lightBg} rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-center`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">EAACI Guideline Step</p>
            <div className={`px-6 py-2 rounded-full ${sm.colorClass} text-white text-xl font-extrabold shadow mb-2`}>{sm.label}</div>
            <p className={`text-sm font-semibold ${sm.textClass}`}>{sm.text}</p>
            {alignLabel && (
              <p className={`mt-3 text-xs font-semibold ${alignLabel.cls}`}>{alignLabel.text}</p>
            )}
          </div>
        </div>

        {/* ── Charts row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Top-3 bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Drug Class Probabilities</h3>
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={top3} layout="vertical" margin={{ left: 5, right: 25 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={v => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                  {top3.map((_, i) => <Cell key={i} fill={top3[i].fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gate weights donut */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Modality Contributions</h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="55%" height={155}>
                <PieChart>
                  <Pie data={gateData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={65}>
                    {gateData.map((_, i) => <Cell key={i} fill={GATE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => `${(v * 100).toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 ml-4 space-y-3">
                {gateData.map((entry, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: GATE_COLORS[i] }} />
                        {entry.name}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">{(entry.value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${entry.value * 100}%`, background: GATE_COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── UAS7 ───────────────────────────────────────────────────────── */}
        {uas7Interp && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Urticaria Activity Score (UAS7)</h3>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-medium mb-1 text-gray-500">
                  <span>0 — Urticaria-free</span>
                  <span className="font-extrabold text-gray-800 dark:text-white text-base">{uas7Interp.score} / 42</span>
                  <span>42 — Severe</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(uas7Interp.score / 42) * 100}%`, backgroundColor: SEV_COLOR[uas7Interp.severity] || '#9ca3af' }}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: SEV_COLOR[uas7Interp.severity] }}>{uas7Interp.category}</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">Range: {uas7Interp.range}</span>
                {uas7Interp.recommended_step && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Guideline: {uas7Interp.recommended_step}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CU Characteristics ─────────────────────────────────────────── */}
        {cuChars && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">CU Image Characteristics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Redness Score',      value: `${(cuChars.redness_mean_score * 100).toFixed(0)}%`,      emoji: '🔴' },
                { label: 'Erythema Coverage',  value: `${cuChars.redness_coverage_pct?.toFixed(1)}%`,            emoji: '🩸' },
                { label: 'Erythema Index',     value: cuChars.erythema_index?.toFixed(3),                        emoji: '📊' },
                { label: 'Wheal Count',        value: cuChars.wheal_count ?? 0,                                  emoji: '💢' },
                { label: 'Avg Diameter',       value: cuChars.wheal_avg_diameter_pct ? `${cuChars.wheal_avg_diameter_pct.toFixed(1)}%` : '—', emoji: '⭕' },
                { label: 'Circularity',        value: cuChars.wheal_mean_circularity ? cuChars.wheal_mean_circularity.toFixed(2) : '—',        emoji: '🔵' },
                { label: 'Distribution',       value: cuChars.distribution_pattern || '—',                       emoji: '📐' },
                { label: 'Shape',              value: cuChars.shape_description ? cuChars.shape_description.split('/')[0].trim() : '—', emoji: '🔷' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">{emoji}</div>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Lab Values Used ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Lab Values Used by Model</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { k: 'CRP',  unit: 'mg/L',  ref: '< 5' },
              { k: 'FT4',  unit: 'ng/dL', ref: '0.8–1.8' },
              { k: 'IgE',  unit: 'IU/mL', ref: '< 100' },
              { k: 'VitD', unit: 'ng/mL', ref: '30–50' },
              { k: 'Age',  unit: 'yr',    ref: '—' },
            ].map(({ k, unit, ref }) => {
              const v = labsUsed[k];
              return (
                <div key={k} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs font-bold text-gray-400 mb-0.5">{k}</p>
                  <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {v !== undefined ? (Number.isInteger(v) ? v : (+v).toFixed(1)) : '—'}
                  </p>
                  <p className="text-xs text-gray-400">{unit}</p>
                  <p className="text-xs text-gray-400 mt-1">ref: {ref}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── EAACI Guideline Detail ──────────────────────────────────────── */}
        {stepDetail?.label && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">EAACI Treatment Guideline</h3>
            <p className="font-bold text-gray-800 dark:text-white text-base mb-1">{stepDetail.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{stepDetail.indication}</p>
            {stepDetail.drugs && (
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Recommended Agents</p>
                <div className="flex flex-wrap gap-2">
                  {stepDetail.drugs.map((d, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-700">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {stepDetail.duration && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Duration: </span>
                {stepDetail.duration}
              </p>
            )}
            {stepDetail.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Clinical Note: </span>{stepDetail.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-center">
          <p className="text-xs text-red-700 dark:text-red-400">
            <FaExclamationTriangle className="inline mr-1" />
            <strong>Clinical Decision Support Only.</strong> This AI assists trained clinicians — it does not replace physician judgment.
            All recommendations must be reviewed and verified by a licensed medical professional before acting.
          </p>
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => { setResult(null); setPhase('form'); }}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 justify-center"
          >
            <FaArrowLeft size={12} /><span>New Analysis</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-400/40 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 justify-center"
          >
            <FaFilePdf /><span>Download Full PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
