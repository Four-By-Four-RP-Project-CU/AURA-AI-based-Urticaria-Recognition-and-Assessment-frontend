import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiUpload, HiSparkles, HiCheckCircle, HiX, HiPhotograph,
  HiChartBar, HiMicrophone, HiRefresh,
  HiBeaker, HiClipboardList, HiAnnotation,
  HiLightningBolt, HiShieldCheck,
} from "react-icons/hi";
import { toast } from "react-toastify";

// â”€â”€â”€ Lab fields config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LAB_FIELDS = [
  { key: "CRP",  label: "CRP",       unit: "mg/L",  hint: "Normal < 5",     placeholder: "e.g. 1.0", step: "0.01" },
  { key: "FT4",  label: "Free T4",   unit: "ng/dL", hint: "Normal 0.8â€“1.8", placeholder: "e.g. 1.2", step: "0.01" },
  { key: "IgE",  label: "Total IgE", unit: "IU/mL", hint: "Normal < 100",   placeholder: "e.g. 70",  step: "0.1"  },
  { key: "VitD", label: "Vitamin D", unit: "ng/mL", hint: "Normal 30â€“100",  placeholder: "e.g. 28",  step: "0.1"  },
];

// Only Age is kept — Weight/Height/diagnosed_age are imputed from training median
const DEMO_FIELDS = [
  { key: "Age", label: "Age", unit: "yrs", placeholder: "e.g. 30", min: 0, max: 120 },
];

// 9 fields — exact dataset values — covers all 4 model prediction tasks
// 5 fields — one per model output task — minimum needed for meaningful predictions
const CLINICAL_SECTIONS = [
  {
    id: "clinical", title: "Quick Clinical Questions", icon: HiClipboardList,
    color: { bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800", header: "bg-indigo-600" },
    fields: [
      { key: "Which applies to your wheals/angioedema or both?",
        label: "Do hives appear on their own or can be triggered?",
        opt: ["Appears spontaneously", "Can induce through specific stimuli"] },
      { key: "No. of wheals",
        label: "How many hives at once?",
        opt: ["Few (<5)", "Moderate (5-20)", "Many (>20)"] },
      { key: "History of Chronic Urticaria",
        label: "Have you had urticaria before?",
        opt: ["Yes", "No"] },
      { key: "Family history of thyroid diseases",
        label: "Thyroid disease in family?",
        opt: ["Yes", "No"] },
      { key: "Family history of autoimmune diseases",
        label: "Autoimmune disease in family?",
        opt: ["Yes", "No"] },
    ],
  },
];

const EMPTY_FORM = {
  Age: "", Weight: "", Height: "", diagnosed_age: "", Sex: "",
  CRP: "", FT4: "", IgE: "", VitD: "",
  symptoms_raw: "", investigations_raw: "",
  "History of Chronic Urticaria": "", "Symptoms Of Urticaria": "",
  "Duration of Symptoms of urticaria": "", "If Wheals are present": "",
  "The shape of an individual wheal": "", "Size of a single Wheal": "",
  "No. of wheals": "", "Duration of wheal": "", Location: "",
  "If  angioedema is present": "", "Duration of angioedema": "",
  "Discomfort of Swelling": "", "Affect of Swelling on Daily activities": "",
  "Angioedema affect on appearance": "", "Overall affect of Swelling": "",
  "Which applies to your wheals/angioedema or both?": "",
  "Which of the following applies to your symptoms of urticaria?": "",
  "Which time of the day do the symptoms occur?": "",
  "Symptoms of Autoinflamation:": "", "Alpha Gal": "", "Specify other allergy": "",
  "Remission of Angioedema after discontinuation of the drug:": "",
  "Family History of Urticaria": "", "Family history of thyroid diseases": "",
  "Family history of autoimmune diseases": "",
};

const SAMPLE = {
  Age: "24", Weight: "62", Height: "168", diagnosed_age: "23", Sex: "Female",
  CRP: "1.0", FT4: "1.2", IgE: "70", VitD: "28",
  symptoms_raw: "Severe itching, raised red welts on arms and torso, worsens at night",
  investigations_raw: "Elevated IgE, positive skin prick test for dust mites",
  "History of Chronic Urticaria": "Yes",
  "Symptoms Of Urticaria": "Wheals and Angioedema",
  "Duration of Symptoms of urticaria": "More than 6 months",
  "If Wheals are present": "Yes",
  "The shape of an individual wheal": "Round",
  "Size of a single Wheal": "Small (< 1 cm)",
  "No. of wheals": "More than 20",
  "Duration of wheal": "Less than 24 hours",
  Location: "Generalized",
  "If  angioedema is present": "Yes",
  "Duration of angioedema": "Less than 24 hours",
  "Discomfort of Swelling": "Severe",
  "Affect of Swelling on Daily activities": "Significantly",
  "Angioedema affect on appearance": "Yes",
  "Overall affect of Swelling": "Moderate",
  "Which applies to your wheals/angioedema or both?": "Both",
  "Which of the following applies to your symptoms of urticaria?": "Spontaneous",
  "Which time of the day do the symptoms occur?": "Morning",
  "Symptoms of Autoinflamation:": "None",
  "Alpha Gal": "No",
  "Specify other allergy": "None",
  "Remission of Angioedema after discontinuation of the drug:": "Yes",
  "Family History of Urticaria": "No",
  "Family history of thyroid diseases": "Yes",
  "Family history of autoimmune diseases": "No",
};

// --- UI Helpers ---
function SectionCard({ title, icon: Icon, color, children }) {
  return (
    <div className={`rounded-2xl border ${color.border} ${color.bg} overflow-hidden`}>
      <div className={`${color.header} px-4 py-3 flex items-center gap-2`}>
        <Icon className="w-4 h-4 text-white" />
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-gray-400 leading-tight">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT_CLS =
  "w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all";

function MicBtn({ onClick, active }) {
  return (
    <button type="button" onClick={onClick} title="Click to fill by voice"
      className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${active
        ? "bg-red-500 text-white animate-pulse"
        : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-cyan-100 hover:text-cyan-600 dark:hover:bg-cyan-900/40 dark:hover:text-cyan-400"}`}
    >
      <HiMicrophone className="w-4 h-4" />
    </button>
  );
}

function OcrChip() {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 font-medium shrink-0">
      <HiSparkles className="w-3 h-3" /> OCR
    </span>
  );
}

// --- Main Component ---
export default function RiskAssessment() {
  const [form, setForm]               = useState(EMPTY_FORM);
  const [files, setFiles]             = useState([]);
  const [ocrData, setOcrData]         = useState(null);
  const [ocrLoading, setOcrLoading]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [listening, setListening]     = useState(false);
  const [voiceField, setVoiceField]   = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceQueue, setVoiceQueue]   = useState([]);
  const fileInputRef   = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const addFiles = (newFiles) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !names.has(f.name))];
    });
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const runOcr = async () => {
    if (!files.length) { toast.warn("Upload at least one lab report image first."); return; }
    setOcrLoading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("categorical_json", "{}");
      const res = await fetch("/predict-ocr", { method: "POST", body: fd });
      if (!res.ok) {
        let msg = `Server error ${res.status}`;
        try { const j = await res.json(); msg = j.detail || msg; } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const labs = data.ocr_info?.labs_extracted ?? {};
      setOcrData(labs);
      const prefilled = {};
      if (labs.CRP  != null) prefilled.CRP  = String(labs.CRP);
      if (labs.FT4  != null) prefilled.FT4  = String(labs.FT4);
      if (labs.IgE  != null) prefilled.IgE  = String(labs.IgE);
      if (labs.VitD != null) prefilled.VitD = String(labs.VitD);
      setForm((prev) => ({ ...prev, ...prefilled }));
      const n = Object.values(prefilled).length;
      toast.success(n > 0
        ? `OCR complete! Auto-filled ${n} lab value${n > 1 ? "s" : ""}.`
        : "OCR ran but no lab values detected. Enter them manually below.");
    } catch (err) {
      toast.error(`OCR failed: ${err.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Block submission if no meaningful data entered at all
    const meaningfulFields = ["Age","Sex","CRP","FT4","IgE","VitD","symptoms_raw","investigations_raw",
      "Which applies to your wheals/angioedema or both?","No. of wheals",
      "History of Chronic Urticaria","Family history of thyroid diseases","Family history of autoimmune diseases"];
    const anyFilled = meaningfulFields.some((k) => form[k] && String(form[k]).trim() !== "");
    if (!anyFilled) {
      toast.warn("Please enter at least one value — lab result, demographic, or clinical question — before running the assessment.");
      return;
    }
    setSubmitting(true);
    try {
      const categorical = {};
      Object.keys(EMPTY_FORM).filter(
        (k) => !["Age","Weight","Height","diagnosed_age","Sex","CRP","FT4","IgE","VitD","symptoms_raw","investigations_raw"].includes(k)
      ).forEach((k) => { if (form[k]) categorical[k] = form[k]; });
      if (form.Sex) categorical["Sex"] = form.Sex;
      const body = {
        symptoms_raw: form.symptoms_raw || "",
        investigations_raw: form.investigations_raw || "",
        categorical,
      };
      if (form.Age)           body.Age           = parseFloat(form.Age);
      if (form.Weight)        body.Weight        = parseFloat(form.Weight);
      if (form.Height)        body.Height        = parseFloat(form.Height);
      if (form.diagnosed_age) body.diagnosed_age = parseFloat(form.diagnosed_age);
      if (form.CRP)           body.CRP           = parseFloat(form.CRP);
      if (form.FT4)           body.FT4           = parseFloat(form.FT4);
      if (form.IgE)           body.IgE           = parseFloat(form.IgE);
      if (form.VitD)          body.VitD          = parseFloat(form.VitD);
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = `Prediction failed (${res.status})`;
        try { const j = await res.json(); msg = j.detail || msg; } catch {}
        throw new Error(msg);
      }
      const result = await res.json();
      const snapshot = { result, form, ocrData, files: files.map((f) => f.name) };
      sessionStorage.setItem("aura_risk_result", JSON.stringify(snapshot));
      // Persist to history in localStorage
      try {
        const HIST_KEY = "aura_risk_history";
        const existing = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
        const record = { ...snapshot, _id: Date.now(), _ts: new Date().toISOString() };
        localStorage.setItem(HIST_KEY, JSON.stringify([record, ...existing].slice(0, 50)));
      } catch {}
      navigate("/risk-results");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  };

  const listenFor = useCallback((fieldKey, fieldLabel, onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.warn("Speech recognition not supported in this browser."); return; }
    if (recognitionRef.current) recognitionRef.current.stop();
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setListening(true); setVoiceField(fieldKey);
    speak(`Please say the value for ${fieldLabel}`);
    rec.onresult = (e) => { const val = e.results[0][0].transcript; onResult(val); setListening(false); setVoiceField(null); };
    rec.onerror = () => { setListening(false); setVoiceField(null); };
    rec.onend   = () => { setListening(false); setVoiceField(null); };
    setTimeout(() => rec.start(), 600);
  }, []);

  const voiceFillField = (key, label) => {
    listenFor(key, label, (val) => setForm((p) => ({ ...p, [key]: val })));
  };

  useEffect(() => {
    if (!voiceActive) { if (recognitionRef.current) recognitionRef.current.stop(); window.speechSynthesis?.cancel(); return; }
    if (voiceQueue.length === 0) { speak("All fields filled. Voice guide complete."); setVoiceActive(false); return; }
    const { key, label } = voiceQueue[0];
    listenFor(key, label, (val) => { setForm((p) => ({ ...p, [key]: val })); setVoiceQueue((q) => q.slice(1)); });
  }, [voiceActive, voiceQueue, listenFor]);

  const toggleVoiceGuide = () => {
    if (voiceActive) { setVoiceActive(false); setVoiceQueue([]); if (recognitionRef.current) recognitionRef.current.stop(); window.speechSynthesis?.cancel(); return; }
    const allFields = [
      ...DEMO_FIELDS.map((f) => ({ key: f.key, label: f.label })),
      { key: "Sex", label: "Sex" },
      ...LAB_FIELDS.map((f) => ({ key: f.key, label: `${f.label} in ${f.unit}` })),
      ...CLINICAL_SECTIONS.flatMap((s) => s.fields.map((f) => ({ key: f.key, label: f.label }))),
    ].filter(({ key }) => !form[key]);
    if (!allFields.length) { speak("All fields are already filled."); return; }
    setVoiceQueue(allFields);
    setVoiceActive(true);
    speak(`Starting voice guide. ${allFields.length} empty fields to fill.`);
  };

  const filled = Object.values(form).filter((v) => v !== "").length;
  const total  = Object.keys(form).length;
  const pct    = Math.round((filled / total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">

      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 px-5 py-5 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-semibold mb-1">
              <HiSparkles className="w-3.5 h-3.5" /> AURA AI Risk Profiling
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Risk & Side-Effect Assessment</h1>
            <p className="text-cyan-200 text-xs mt-1">CU Type  Severity  Secondary Risk  Side-Effect Profile</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setForm(SAMPLE); toast.info("Sample data loaded!"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/20">
              <HiRefresh className="w-4 h-4" /> Sample
            </button>
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setOcrData(null); setFiles([]); sessionStorage.removeItem("aura_risk_result"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/20">
              <HiX className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-3">
          <div className="flex justify-between text-xs text-cyan-200 mb-1">
            <span>Form completion</span><span>{pct}% ({filled}/{total} fields)</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* SECTION 1 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-4 flex items-center gap-2">
            <HiPhotograph className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">Step 1  Upload Lab Report Images</h2>
            <span className="ml-auto text-xs text-violet-200 hidden sm:block">AI detects CRP  FT4  IgE  Vitamin D</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}>
              <HiUpload className="w-10 h-10 text-violet-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">Drop images here, or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">JPG  PNG  PDF  TIFF  OCR extracts lab values automatically</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={(e) => addFiles(Array.from(e.target.files || []))} />
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <HiPhotograph className="w-5 h-5 text-violet-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{f.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2">
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={runOcr} disabled={ocrLoading || !files.length}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
              {ocrLoading
                ? <><span className="animate-spin rounded-full border-2 border-white border-t-transparent w-5 h-5" /> Extracting lab values via OCR...</>
                : <><HiSparkles className="w-5 h-5" /> Extract Lab Values from Images</>}
            </button>
            {ocrData && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-300 dark:border-green-800 p-4">
                <p className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm mb-3">
                  <HiCheckCircle className="w-5 h-5" /> OCR Complete  values auto-filled below
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["CRP","FT4","IgE","VitD"].map((k) => (
                    <div key={k} className="text-center p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 font-medium">{k}</p>
                      <p className={`text-xl font-extrabold mt-0.5 ${ocrData[k] != null ? "text-green-600 dark:text-green-400" : "text-gray-300 dark:text-gray-600"}`}>
                        {ocrData[k] != null ? ocrData[k] : ""}
                      </p>
                      <p className="text-xs text-gray-400">{ocrData[k] != null ? "extracted " : "not found"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-xs text-gray-400">Skip this step to enter lab values manually in Step 2</p>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 flex items-center gap-2">
            <HiBeaker className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">Step 2  Lab Values &amp; Demographics</h2>
            <span className="ml-auto text-xs text-teal-200 hidden sm:block">All optional  AI imputes missing values</span>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Laboratory Values</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LAB_FIELDS.map((f) => (
                  <FieldRow key={f.key}
                    label={<span className="flex items-center gap-1.5 flex-wrap">{f.label} <span className="text-gray-400 font-normal normal-case">({f.unit})</span>{ocrData?.[f.key] != null && <OcrChip />}</span>}
                    hint={f.hint}>
                    <div className="flex items-center gap-1.5">
                      <input name={f.key} type="number" step={f.step} min="0" value={form[f.key]} onChange={change}
                        placeholder={f.placeholder}
                        className={`${INPUT_CLS} ${ocrData?.[f.key] != null ? "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/30" : ""}`} />
                      <MicBtn active={listening && voiceField === f.key} onClick={() => voiceFillField(f.key, `${f.label} in ${f.unit}`)} />
                    </div>
                  </FieldRow>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Patient Demographics</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="Sex">
                  <div className="flex items-center gap-1.5">
                    <select name="Sex" value={form.Sex} onChange={change} className={INPUT_CLS}>
                      <option value="">Select...</option>
                      {["Male","Female","Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <MicBtn active={listening && voiceField === "Sex"} onClick={() => voiceFillField("Sex", "sex")} />
                  </div>
                </FieldRow>
                {DEMO_FIELDS.map((f) => (
                  <FieldRow key={f.key} label={<span>{f.label} <span className="text-gray-400 font-normal">({f.unit})</span></span>}>
                    <div className="flex items-center gap-1.5">
                      <input name={f.key} type="number" min={f.min} max={f.max} value={form[f.key]} onChange={change}
                        placeholder={f.placeholder} className={INPUT_CLS} />
                      <MicBtn active={listening && voiceField === f.key} onClick={() => voiceFillField(f.key, `${f.label} in ${f.unit}`)} />
                    </div>
                  </FieldRow>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Clinical Notes <span className="normal-case font-normal">(for AI language analysis)</span>
              </p>
              <div className="space-y-3">
                <FieldRow label="Symptoms Description" hint="Describe itching, wheals, swelling, triggers, timing, severity">
                  <div className="flex items-start gap-1.5">
                    <textarea name="symptoms_raw" value={form.symptoms_raw} onChange={change} rows={3}
                      placeholder="e.g. Severe itching with raised red welts on arms and torso, worsens at night..."
                      className={`${INPUT_CLS} resize-none`} />
                    <MicBtn active={listening && voiceField === "symptoms_raw"} onClick={() => voiceFillField("symptoms_raw", "symptoms description")} />
                  </div>
                </FieldRow>
                <FieldRow label="Investigation Results" hint="Lab results, allergy tests, clinical findings">
                  <div className="flex items-start gap-1.5">
                    <textarea name="investigations_raw" value={form.investigations_raw} onChange={change} rows={3}
                      placeholder="e.g. Elevated IgE 450 IU/mL, positive skin prick test for dust mites..."
                      className={`${INPUT_CLS} resize-none`} />
                    <MicBtn active={listening && voiceField === "investigations_raw"} onClick={() => voiceFillField("investigations_raw", "investigation results")} />
                  </div>
                </FieldRow>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow">
              <HiClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Step 3  Clinical Questionnaire</h2>
              <p className="text-xs text-gray-400">5 questions · all optional · covers all 4 prediction outputs</p>
            </div>
          </div>
          <div className="space-y-4">
            {CLINICAL_SECTIONS.map((sec) => (
              <SectionCard key={sec.id} title={sec.title} icon={sec.icon} color={sec.color}>
                {sec.fields.map((f) => (
                  <FieldRow key={f.key} label={f.label}>
                    <div className="flex items-center gap-1.5">
                      <select name={f.key} value={form[f.key]} onChange={change} className={INPUT_CLS}>
                        <option value="">Select...</option>
                        {f.opt.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <MicBtn active={listening && voiceField === f.key} onClick={() => voiceFillField(f.key, f.label)} />
                    </div>
                  </FieldRow>
                ))}
              </SectionCard>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-3 pb-6">
          <div className="flex items-start gap-3 p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800 text-sm text-cyan-800 dark:text-cyan-300">
            <HiSparkles className="w-4 h-4 flex-shrink-0 text-cyan-500 mt-0.5" />
            <span>Unfilled fields are automatically imputed by the AI model. More complete data = more accurate predictions.</span>
          </div>
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]">
            {submitting
              ? <><span className="animate-spin rounded-full border-2 border-white border-t-transparent w-6 h-6" /> Analyzing with AI...</>
              : <><HiChartBar className="w-6 h-6" /> Generate Full Risk &amp; Side-Effect Profile</>}
          </button>
        </div>
      </div>

      {/* Floating Voice Guide */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">
        {voiceActive && voiceQueue.length > 0 && (
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg max-w-[200px] text-right">
            <p className="font-semibold text-cyan-300">Now asking:</p>
            <p className="mt-0.5 truncate">{voiceQueue[0]?.label}</p>
            <p className="text-gray-400 mt-1">{voiceQueue.length} field{voiceQueue.length > 1 ? "s" : ""} remaining</p>
          </div>
        )}
        <button type="button" onClick={toggleVoiceGuide}
          title={voiceActive ? "Stop Voice Guide" : "Start Voice Guide"}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
            voiceActive ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-gradient-to-br from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"}`}>
          {voiceActive ? <HiX className="w-6 h-6 text-white" /> : <HiMicrophone className="w-6 h-6 text-white" />}
        </button>
        {!voiceActive && <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Voice Guide</span>}
      </div>
    </div>
  );
}
