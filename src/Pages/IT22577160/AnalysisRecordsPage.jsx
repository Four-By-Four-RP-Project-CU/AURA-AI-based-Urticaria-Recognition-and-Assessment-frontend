import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMicroscope, FaTrash, FaExclamationTriangle,
  FaCalendarAlt, FaUser, FaFlask, FaChartBar, FaSearch, FaInbox, FaEye,
} from 'react-icons/fa';

const STORAGE_KEY = 'aura_analysis_records';

const DRUG_META = {
  H1_ANTIHISTAMINE: { label: 'H1 Antihistamine', badgeCls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300', dot: 'bg-sky-500' },
  LTRA:             { label: 'LTRA',              badgeCls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  ADVANCED_THERAPY: { label: 'Advanced Therapy',  badgeCls: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300', dot: 'bg-violet-500' },
  OTHER:            { label: 'Other Therapy',      badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
};

const STEP_META = {
  STEP_1: { label: 'Step 1', cls: 'bg-emerald-500' },
  STEP_2: { label: 'Step 2', cls: 'bg-yellow-500' },
  STEP_3: { label: 'Step 3', cls: 'bg-orange-500' },
  STEP_4: { label: 'Step 4', cls: 'bg-red-600' },
};

function ConfidenceMini({ value, abstain }) {
  const pct = Math.round((value || 0) * 100);
  const barCls = abstain || value < 0.55 ? 'bg-red-400' : value < 0.75 ? 'bg-yellow-400' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
        <span>Confidence</span>
        <span className="font-bold text-gray-700 dark:text-gray-200">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RecordCard({ record, onDelete, onView }) {
  const drug = record.predicted_drug_group || 'OTHER';
  const dm = DRUG_META[drug] || DRUG_META.OTHER;
  const stepKey = record.mapped_guideline_step || 'STEP_1';
  const sm = STEP_META[stepKey] || STEP_META.STEP_1;
  const usedLabs = record.used_features || record._labs || {};
  const ts = record._ts ? new Date(record._ts).toLocaleString() : '—';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={() => onView(record)}
    >
      {/* Skin image thumbnail */}
      <div className="relative h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {record._skinPreview ? (
          <img src={record._skinPreview} alt="Skin" className="w-full h-full object-cover" />
        ) : (
          <FaMicroscope className="text-4xl text-gray-300 dark:text-gray-600" />
        )}
        {/* Step badge overlay */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-xs font-bold shadow ${sm.cls}`}>
          {sm.label}
        </span>
        {/* Abstain flag */}
        {record.abstain && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <FaExclamationTriangle size={10} /> Low Conf.
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Patient info */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1">
              <FaUser className="text-gray-400" size={11} />
              {record._patientName || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Case: {record._caseId || '—'}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${dm.badgeCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${dm.dot}`} />
            {dm.label}
          </span>
        </div>

        {/* Confidence */}
        <ConfidenceMini value={record.confidence} abstain={record.abstain} />

        {/* Lab values chips */}
        <div>
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaFlask size={10} /> Lab Values Used</p>
          <div className="flex flex-wrap gap-1">
            {['CRP', 'FT4', 'IgE', 'VitD', 'Age'].map(k => {
              const v = usedLabs[k];
              return v != null ? (
                <span key={k} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                  {k}: {Number.isInteger(+v) ? +v : (+v).toFixed(1)}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* UAS7 if present */}
        {record.uas7_interpretation && (
          <div className="flex items-center gap-2">
            <FaChartBar className="text-gray-400" size={11} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              UAS7: <strong className="text-gray-700 dark:text-gray-200">{record.uas7_interpretation.score}</strong>
              <span className="ml-1 text-gray-400">({record.uas7_interpretation.category})</span>
            </span>
          </div>
        )}

        {/* Timestamp + delete */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FaCalendarAlt size={10} /> {ts}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onView(record); }}
              className="text-indigo-400 hover:text-indigo-600 transition-colors p-1 rounded"
              title="View results"
            >
              <FaEye size={13} />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete(record._id); }}
              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
              title="Delete record"
            >
              <FaTrash size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AnalysisRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleView = (record) => {
    navigate('/analyze', { state: { viewRecord: record } });
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecords(stored);
    } catch {
      setRecords([]);
    }
  }, []);

  const handleDelete = (id) => {
    const updated = records.filter(r => r._id !== id);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!window.confirm('Delete all analysis records? This cannot be undone.')) return;
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (
      !q ||
      (r._patientName || '').toLowerCase().includes(q) ||
      (r._caseId || '').toLowerCase().includes(q) ||
      (r.predicted_drug_group || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3 rounded-xl text-white shadow-lg">
              <FaMicroscope size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Analysis Records</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {records.length} record{records.length !== 1 ? 's' : ''} stored locally
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient / case…"
                className="pl-8 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <FaInbox className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
              {search ? 'No records match your search.' : 'No analysis records yet.'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {!search && 'Run an AURA analysis — results will appear here automatically.'}
            </p>
          </div>
        )}

        {/* Cards grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(record => (
              <RecordCard key={record._id} record={record} onDelete={handleDelete} onView={handleView} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisRecordsPage;
