import React, { useState } from 'react';
import { FaFlask, FaPlus, FaSave, FaTrash, FaSearch, FaCalendar, FaFileAlt } from 'react-icons/fa';

const LabEntryPage = () => {
  const [selectedPatient, setSelectedPatient] = useState('PT-2024-001234');
  const [searchQuery, setSearchQuery] = useState('');
  const [labEntries, setLabEntries] = useState([
    {
      id: 1,
      date: '2024-12-01',
      testName: 'Complete Blood Count (CBC)',
      results: [
        { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
        { parameter: 'WBC Count', value: '7.2', unit: '10^3/µL', range: '4.5-11.0', status: 'normal' },
        { parameter: 'Platelet Count', value: '250', unit: '10^3/µL', range: '150-400', status: 'normal' }
      ]
    },
    {
      id: 2,
      date: '2024-11-28',
      testName: 'Lipid Panel',
      results: [
        { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', range: '<200', status: 'high' },
        { parameter: 'LDL Cholesterol', value: '140', unit: 'mg/dL', range: '<100', status: 'high' },
        { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', range: '>40', status: 'normal' },
        { parameter: 'Triglycerides', value: '175', unit: 'mg/dL', range: '<150', status: 'high' }
      ]
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    testName: '',
    results: [{ parameter: '', value: '', unit: '', range: '', status: 'normal' }]
  });

  const [isAddingNew, setIsAddingNew] = useState(false);

  const addResultRow = () => {
    setNewEntry({
      ...newEntry,
      results: [...newEntry.results, { parameter: '', value: '', unit: '', range: '', status: 'normal' }]
    });
  };

  const removeResultRow = (index) => {
    const updatedResults = newEntry.results.filter((_, i) => i !== index);
    setNewEntry({ ...newEntry, results: updatedResults });
  };

  const updateResultRow = (index, field, value) => {
    const updatedResults = [...newEntry.results];
    updatedResults[index][field] = value;
    setNewEntry({ ...newEntry, results: updatedResults });
  };

  const saveNewEntry = () => {
    if (newEntry.testName && newEntry.results.some(r => r.parameter && r.value)) {
      setLabEntries([
        { id: Date.now(), ...newEntry },
        ...labEntries
      ]);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        testName: '',
        results: [{ parameter: '', value: '', unit: '', range: '', status: 'normal' }]
      });
      setIsAddingNew(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical': return 'bg-red-200 text-red-900 border-red-400';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const commonTests = [
    'Complete Blood Count (CBC)',
    'Basic Metabolic Panel',
    'Comprehensive Metabolic Panel',
    'Lipid Panel',
    'Liver Function Test',
    'Thyroid Function Test',
    'HbA1c',
    'Urinalysis',
    'Blood Glucose',
    'Creatinine'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaFlask className="mr-3 text-purple-600" />
                Laboratory Results
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Patient ID: {selectedPatient}</p>
            </div>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="group relative inline-flex items-center justify-center space-x-2 px-6 py-3 text-base font-bold text-white transition-all duration-500 bg-gradient-to-r from-teal-600 to-sky-600 rounded-xl shadow-lg hover:shadow-teal-500/50 hover:scale-105 overflow-hidden"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-48 group-hover:h-48 opacity-10"></span>
              <FaPlus className="relative z-10" />
              <span className="relative z-10">Add New Lab Entry</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lab tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* New Entry Form */}
        {isAddingNew && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border-2 border-teal-500">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FaFileAlt className="mr-3 text-purple-600" />
              New Lab Entry
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  <FaCalendar className="inline mr-2" />Test Date
                </label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Test Name
                </label>
                <select
                  value={newEntry.testName}
                  onChange={(e) => setNewEntry({ ...newEntry, testName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a test</option>
                  {commonTests.map((test, idx) => (
                    <option key={idx} value={test}>{test}</option>
                  ))}
                  <option value="other">Other (Custom)</option>
                </select>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Parameter</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Value</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Reference Range</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newEntry.results.map((result, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={result.parameter}
                          onChange={(e) => updateResultRow(index, 'parameter', e.target.value)}
                          placeholder="e.g., Hemoglobin"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={result.value}
                          onChange={(e) => updateResultRow(index, 'value', e.target.value)}
                          placeholder="e.g., 14.5"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={result.unit}
                          onChange={(e) => updateResultRow(index, 'unit', e.target.value)}
                          placeholder="e.g., g/dL"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={result.range}
                          onChange={(e) => updateResultRow(index, 'range', e.target.value)}
                          placeholder="e.g., 13.5-17.5"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <select
                          value={result.status}
                          onChange={(e) => updateResultRow(index, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="low">Low</option>
                          <option value="critical">Critical</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => removeResultRow(index)}
                          disabled={newEntry.results.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <button
                onClick={addResultRow}
                className="group relative inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-gray-800 dark:text-white transition-all duration-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
              >
                <FaPlus />
                <span>Add Parameter</span>
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-gray-500 hover:bg-gray-600 rounded-lg hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewEntry}
                  className="group relative inline-flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white transition-all duration-500 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg hover:shadow-green-500/50 hover:scale-105 overflow-hidden"
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-48 group-hover:h-48 opacity-10"></span>
                  <FaSave className="relative z-10" />
                  <span className="relative z-10">Save Entry</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Lab Entries */}
        <div className="space-y-6">
          {labEntries
            .filter(entry => 
              searchQuery === '' || 
              entry.testName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{entry.testName}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <FaCalendar className="inline mr-2" />
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                    <FaFileAlt size={20} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Parameter</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Value</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Reference Range</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.results.map((result, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{result.parameter}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-bold">{result.value}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.unit}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.range}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(result.status)}`}>
                              {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LabEntryPage;
