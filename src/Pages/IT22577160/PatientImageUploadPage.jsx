import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaImage, FaTrash, FaDownload, FaExpand, FaTimes, FaCamera, FaCheckCircle, FaExclamationTriangle, FaFlask, FaUser, FaPrescription, FaChartLine } from 'react-icons/fa';

const STORAGE_KEY = 'aura_uploaded_images';
const MAX_STORED_IMAGES = 50; // Limit to prevent localStorage overflow

// Clinical Guidelines
const CLINICAL_GUIDELINES = {
  H1_ANTIHISTAMINE: {
    title: 'H1 ANTIHISTAMINES (First-line treatment)',
    sections: [
      {
        heading: 'Who should receive this',
        content: 'All patients with chronic urticaria (spontaneous or inducible)'
      },
      {
        heading: 'How to prescribe',
        items: [
          'Start with a second-generation (non-sedating) H1 antihistamine',
          'Use standard licensed dose',
          'If symptoms persist → increase the dose gradually up to 4×',
          'Review after 2–4 weeks'
        ]
      },
      {
        heading: 'Important rules',
        items: [
          'Use one antihistamine only',
          'Do not combine different antihistamines',
          'Avoid first-generation antihistamines for routine use'
        ]
      },
      {
        heading: 'Clinical note',
        content: 'This remains the backbone of treatment at all stages.'
      }
    ]
  },
  LTRA: {
    title: 'LTRA (Leukotriene Receptor Antagonists)',
    sections: [
      {
        heading: 'When to consider',
        content: 'Symptoms persist despite adequate antihistamine dosing',
        items: [
          'NSAIDs worsen urticaria',
          'Exercise- or inducible-type urticaria present'
        ],
        subheading: 'Particularly useful if:'
      },
      {
        heading: 'How to prescribe',
        items: [
          'Add Montelukast to ongoing antihistamine therapy',
          'Use as adjunct only'
        ]
      },
      {
        heading: 'Important rules',
        items: [
          'Never use as monotherapy',
          'Do not replace antihistamines'
        ]
      },
      {
        heading: 'Clinical note',
        content: 'LTRAs provide modest benefit and should be considered supportive.'
      }
    ]
  },
  ADVANCED_THERAPY: {
    title: 'ADVANCED THERAPY (Third-line treatment)',
    sections: [
      {
        heading: 'When to escalate',
        items: [
          'Disease remains uncontrolled despite high-dose antihistamines',
          'Chronic spontaneous urticaria confirmed',
          'Impact on quality of life is significant'
        ]
      },
      {
        heading: 'Preferred options',
        items: [
          'Omalizumab (first choice)',
          'Cyclosporine A (alternative if biologic unavailable)'
        ]
      },
      {
        heading: 'How to use',
        items: [
          'Always as add-on therapy',
          'Initiated and monitored by a specialist',
          'Continue antihistamines alongside'
        ]
      },
      {
        heading: 'Important rules',
        items: [
          'Not for mild disease',
          'Not first- or second-line',
          'Requires monitoring for adverse effects'
        ]
      },
      {
        heading: 'Clinical note',
        content: 'Advanced therapies are reserved for refractory disease.'
      }
    ]
  }
};

// Get guideline based on drug class
const getGuideline = (step, drug) => {
  return CLINICAL_GUIDELINES[drug] || null;
};

const PatientImageUploadPage = () => {
  const [uploadedImages, setUploadedImages] = useState(() => {
    // Load from localStorage on initial mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved images:', error);
      return [];
    }
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showGuidelinePopup, setShowGuidelinePopup] = useState(false);
  const fileInputRef = useRef(null);

  // Save to localStorage whenever uploadedImages changes
  useEffect(() => {
    try {
      // Limit number of stored images to prevent localStorage overflow
      const imagesToSave = uploadedImages.slice(0, MAX_STORED_IMAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imagesToSave));
    } catch (error) {
      console.error('Error saving images to localStorage:', error);
      // If quota exceeded, try to save fewer images
      if (error.name === 'QuotaExceededError') {
        try {
          const reducedImages = uploadedImages.slice(0, 10);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedImages));
          alert('Storage limit reached. Only the 10 most recent images were saved.');
        } catch (e) {
          console.error('Still failed to save images:', e);
        }
      }
    }
  }, [uploadedImages]);

  const [newImageData, setNewImageData] = useState({
    category: 'Initial Assessment',
    notes: ''
  });

  // Patient Lab Data State
  const [labData, setLabData] = useState({
    CRP: '',
    FT4: '',
    IgE: '',
    VitD: ''
  });

  // Patient Clinical Data State
  const [clinicalData, setClinicalData] = useState({
    Age: '',
    Weight: '',
    Height: '',
    AgeFirstSymptoms: '',
    DiagnosedAge: '',
    ItchingScore: '5',
    AngioedemaDrugQ: '0'  // 0=No, 1=Yes, 2=Unknown
  });

  const categories = [
    'Initial Assessment',
    'Follow-up',
    'Progress Check',
    'Treatment Response',
    'Adverse Reaction',
    'Healed',
    'Other'
  ];

  const handleFileSelect = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage({
          url: reader.result,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          file: file  // Store the actual file object
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const handleUpload = async () => {
    if (!previewImage || !previewImage.file) {
      alert('Please select an image first');
      return;
    }

    // Validate lab data
    if (!labData.CRP || !labData.FT4 || !labData.IgE || !labData.VitD) {
      alert('Please fill in all lab values');
      return;
    }

    // Validate clinical data
    if (!clinicalData.Age || !clinicalData.Weight || !clinicalData.Height || 
        !clinicalData.AgeFirstSymptoms || !clinicalData.DiagnosedAge) {
      alert('Please fill in all required clinical data fields (Age, Weight, Height, Age First Symptoms, Diagnosed Age)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', previewImage.file);
      
      // Add lab data
      formData.append('CRP', parseFloat(labData.CRP));
      formData.append('FT4', parseFloat(labData.FT4));
      formData.append('IgE', parseFloat(labData.IgE));
      formData.append('VitD', parseFloat(labData.VitD));
      
      // Add clinical data (match backend field names exactly)
      formData.append('Age', parseFloat(clinicalData.Age));
      formData.append('Weight', parseFloat(clinicalData.Weight));
      formData.append('Height', parseFloat(clinicalData.Height));
      formData.append('AgeFirstSymptoms', parseFloat(clinicalData.AgeFirstSymptoms));
      formData.append('DiagnosedAge', parseFloat(clinicalData.DiagnosedAge));
      formData.append('ItchingScore', parseFloat(clinicalData.ItchingScore));
      formData.append('AngioedemaDrugQ', parseFloat(clinicalData.AngioedemaDrugQ));
      
      // Request Grad-CAM overlay
      //formData.append('return_gradcam', 1);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      // Call the prediction API
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowResults(true);

      // Save to uploaded images
      const newImage = {
        id: Date.now(),
        url: previewImage.url,
        name: previewImage.name,
        uploadDate: new Date().toISOString().split('T')[0],
        category: newImageData.category,
        notes: newImageData.notes,
        size: previewImage.size,
        labData: { ...labData },
        clinicalData: { ...clinicalData },
        prediction: result
      };
      setUploadedImages([newImage, ...uploadedImages]);

      // Reset form after 2 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setPreviewImage(null);
        setShowResults(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to analyze image. Please ensure the backend is running on http://localhost:8000');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  const handleClearAll = () => {
    if (uploadedImages.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete all ${uploadedImages.length} stored analyses? This cannot be undone.`
    );
    
    if (confirmed) {
      setUploadedImages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleDownload = (image) => {
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name || 'analysis-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullscreen = (image) => {
    setSelectedImage(image);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaCamera className="mr-3 text-pink-600" />
                Chronic Urticaria Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Upload patient images and clinical data for AI-powered treatment recommendation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 dark:bg-pink-900/30 px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold text-pink-800 dark:text-pink-300">
                  {uploadedImages.length} Analysis Stored
                </p>
              </div>
              {uploadedImages.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                >
                  <FaTrash size={12} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FaUpload className="mr-2 text-blue-600" />
                Upload Patient Image
              </h2>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <FaImage className="mx-auto text-6xl text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG, JPEG up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Preview & Form */}
              {previewImage && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={previewImage.url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                        setShowResults(false);
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Lab Data Section */}
                  <div className="border-t pt-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      <FaFlask className="mr-2 text-green-600" />
                      Laboratory Values
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          CRP (mg/L)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={labData.CRP}
                          onChange={(e) => setLabData({ ...labData, CRP: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          FT4 (pmol/L)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={labData.FT4}
                          onChange={(e) => setLabData({ ...labData, FT4: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          IgE (IU/mL)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={labData.IgE}
                          onChange={(e) => setLabData({ ...labData, IgE: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Vitamin D (ng/mL)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={labData.VitD}
                          onChange={(e) => setLabData({ ...labData, VitD: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinical Data Section */}
                  <div className="border-t pt-4">
                    <h3 className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      <FaUser className="mr-2 text-purple-600" />
                      Clinical Information
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                            Age (years)
                          </label>
                          <input
                            type="number"
                            value={clinicalData.Age}
                            onChange={(e) => setClinicalData({ ...clinicalData, Age: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                            Diagnosed Age (years)
                          </label>
                          <input
                            type="number"
                            value={clinicalData.DiagnosedAge}
                            onChange={(e) => setClinicalData({ ...clinicalData, DiagnosedAge: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Diagnosed Age"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={clinicalData.Weight}
                            onChange={(e) => setClinicalData({ ...clinicalData, Weight: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Weight"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={clinicalData.Height}
                            onChange={(e) => setClinicalData({ ...clinicalData, Height: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Height"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Age First Symptoms (years)
                        </label>
                        <input
                          type="number"
                          value={clinicalData.AgeFirstSymptoms}
                          onChange={(e) => setClinicalData({ ...clinicalData, AgeFirstSymptoms: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Age when symptoms first appeared"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Itching Score (0-10)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={clinicalData.ItchingScore}
                          onChange={(e) => setClinicalData({ ...clinicalData, ItchingScore: e.target.value })}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                          {clinicalData.ItchingScore}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          Angioedema from Drug?
                        </label>
                        <select
                          value={clinicalData.AngioedemaDrugQ}
                          onChange={(e) => setClinicalData({ ...clinicalData, AngioedemaDrugQ: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                          <option value="2">Unknown</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Category and Notes */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={newImageData.category}
                          onChange={(e) => setNewImageData({ ...newImageData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={newImageData.notes}
                          onChange={(e) => setNewImageData({ ...newImageData, notes: e.target.value })}
                          placeholder="Add notes about this analysis..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        File: {previewImage.name} ({previewImage.size})
                      </p>

                      {isUploading && (
                        <div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
                            Analyzing... {uploadProgress}%
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                      >
                        <FaUpload />
                        <span>{isUploading ? 'Analyzing...' : 'Analyze & Predict'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results & Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Results */}
            {showResults && analysisResult && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                  <FaPrescription className="mr-3 text-green-600" />
                  AI Analysis Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Decision Status */}
                  <div className={`p-4 rounded-lg ${
                    analysisResult.invalid_image || analysisResult.abstain 
                      ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400' 
                      : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400'
                  }`}>
                    <div className="flex items-center mb-2">
                      {analysisResult.invalid_image || analysisResult.abstain ? (
                        <FaExclamationTriangle className="text-red-600 text-2xl mr-2" />
                      ) : (
                        <FaCheckCircle className="text-green-600 text-2xl mr-2" />
                      )}
                      <h3 className="font-bold text-lg">Decision</h3>
                    </div>
                    <p className={`text-2xl font-bold ${
                      analysisResult.invalid_image || analysisResult.abstain ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {analysisResult.final_decision}
                    </p>
                    {(analysisResult.invalid_image || analysisResult.abstain) && analysisResult.abstain_reason && (
                      <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-600">
                        <p className="text-sm text-red-800 dark:text-red-200 flex items-start">
                          <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>{analysisResult.abstain_reason}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FaChartLine className="text-blue-600 text-2xl mr-2" />
                      <h3 className="font-bold text-lg">Confidence</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Recommended Drug & Step */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      Recommended Drug Group
                    </h4>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {analysisResult.pred_drug}
                    </p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                      Guideline Step
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                        {analysisResult.pred_step}
                      </p>
                      <button
                        onClick={() => {
                          console.log('Guideline button clicked!');
                          console.log('analysisResult:', analysisResult);
                          setShowGuidelinePopup(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md"
                        title="View Clinical Guidelines"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        View Guideline
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Violation Score
                    </h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {(analysisResult.violation_score * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Filter Adjustment
                    </h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {analysisResult.adjusted_by_filter ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* FiLM Contribution */}
                {analysisResult.film_contribution && analysisResult.film_contribution.enabled && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      FiLM Layer Contribution
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gamma L2 Mean</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {analysisResult.film_contribution.gamma_l2_mean?.toFixed(4) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Beta L2 Mean</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {analysisResult.film_contribution.beta_l2_mean?.toFixed(4) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Image Delta L2</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {analysisResult.film_contribution.image_delta_l2_mean?.toFixed(4) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning/Info Messages */}
                {analysisResult.abstain && (
                  <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="text-yellow-600 mt-1 mr-3" />
                      <div>
                        <p className="font-bold text-yellow-800 dark:text-yellow-300">
                          Recommendation Abstained
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          The AI model is not confident enough to make a recommendation. 
                          Please consult with a medical professional for diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Analysis History
                </h2>
                {uploadedImages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaCheckCircle className="text-green-500" />
                    <span>Auto-saved</span>
                  </div>
                )}
              </div>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-12">
                  <FaImage className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No analysis performed yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Upload a patient image and fill in the clinical data to get started
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 italic">
                    Your analyses will be saved locally and persist across page refreshes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                    >
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => openFullscreen(image)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <button
                            onClick={() => openFullscreen(image)}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-3 rounded-full transition-all"
                          >
                            <FaExpand size={20} />
                          </button>
                        </div>
                        <span className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {image.category}
                        </span>
                        {image.prediction && (
                          <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            image.prediction.abstain 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {image.prediction.abstain ? 'REFER' : 'ANALYZED'}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 truncate">
                          {image.name}
                        </h3>
                        
                        {/* Prediction Summary */}
                        {image.prediction && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-600 dark:to-gray-500 rounded-lg">
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Drug:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {image.prediction.pred_drug}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Step:</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {image.prediction.pred_step}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Confidence:</span>
                                <span className="font-semibold text-blue-600">
                                  {(image.prediction.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {image.notes || 'No notes'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
                          <span>{image.size}</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => openFullscreen(image)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 text-sm"
                          >
                            <FaExpand size={12} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1 text-sm"
                          >
                            <FaTrash size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guideline Popup Modal */}
      {showGuidelinePopup && (analysisResult || selectedImage) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowGuidelinePopup(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                📋 Clinical Treatment Guidelines
              </h3>
              <button
                onClick={() => setShowGuidelinePopup(false)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {(() => {
                const currentResult = analysisResult || selectedImage?.prediction;
                const guideline = getGuideline(currentResult.pred_step, currentResult.pred_drug);
                if (!guideline) {
                  return (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      No specific guideline available for this drug class.
                    </p>
                  );
                }
                return (
                  <div>
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border-2 border-teal-400 dark:border-teal-600 p-6 rounded-lg mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold">
                          {currentResult.pred_drug}
                        </div>
                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
                          {currentResult.pred_step}
                        </div>
                      </div>
                      <h4 className="font-bold text-teal-900 dark:text-teal-100 text-xl mb-4">
                        {guideline.title}
                      </h4>
                      
                      <div className="space-y-4">
                        {guideline.sections.map((section, idx) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                            <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg flex items-center">
                              <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm mr-2">
                                {idx + 1}
                              </span>
                              {section.heading}
                            </h5>
                            {section.content && (
                              <p className="text-gray-700 dark:text-gray-300 mb-3 pl-12">
                                {section.content}
                              </p>
                            )}
                            {section.subheading && (
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-2 pl-12 italic">
                                {section.subheading}
                              </p>
                            )}
                            {section.items && (
                              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 pl-12">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="leading-relaxed">{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 p-4 rounded-lg mt-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <strong>Note:</strong>&nbsp;These guidelines are based on established clinical protocols. Always consult with a healthcare professional for patient-specific treatment decisions.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="fixed top-4 right-4 bg-white text-gray-800 p-3 rounded-full hover:bg-gray-200 transition-all z-10"
          >
            <FaTimes size={24} />
          </button>
          
          <div className="max-w-6xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full h-auto max-h-[50vh] object-contain rounded-lg mb-4"
            />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {selectedImage.name}
              </h3>

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Category</p>
                  <p className="text-gray-800 dark:text-white font-semibold">{selectedImage.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Upload Date</p>
                  <p className="text-gray-800 dark:text-white font-semibold">
                    {new Date(selectedImage.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">File Size</p>
                  <p className="text-gray-800 dark:text-white font-semibold">{selectedImage.size}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
                  <p className={`font-semibold ${
                    selectedImage.prediction?.abstain ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {selectedImage.prediction?.abstain ? 'Referred' : 'Analyzed'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedImage.notes && (
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Notes</p>
                  <p className="text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedImage.notes}
                  </p>
                </div>
              )}

              {/* Prediction Results */}
              {selectedImage.prediction && (
                <div className="border-t pt-6">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <FaPrescription className="mr-2 text-green-600" />
                    AI Prediction Results
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 rounded-lg ${
                      selectedImage.prediction.invalid_image || selectedImage.prediction.abstain 
                        ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-400' 
                        : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-400'
                    }`}>
                      <p className="text-sm font-semibold mb-1">Final Decision</p>
                      <p className={`text-xl font-bold ${
                        selectedImage.prediction.invalid_image || selectedImage.prediction.abstain ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {selectedImage.prediction.final_decision}
                      </p>
                      {(selectedImage.prediction.invalid_image || selectedImage.prediction.abstain) && selectedImage.prediction.abstain_reason && (
                        <div className="mt-2 pt-2 border-t border-red-300 dark:border-red-600">
                          <p className="text-xs text-red-800 dark:text-red-200 flex items-start">
                            <FaExclamationTriangle className="mr-1.5 mt-0.5 flex-shrink-0 text-sm" />
                            <span>{selectedImage.prediction.abstain_reason}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Confidence Score</p>
                      <p className="text-xl font-bold text-blue-700">
                        {(selectedImage.prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Recommended Drug</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {selectedImage.prediction.pred_drug}
                      </p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-300 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Guideline Step</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                          {selectedImage.prediction.pred_step}
                        </p>
                        <button
                          onClick={() => {
                            console.log('Fullscreen modal button clicked!');
                            console.log('selectedImage:', selectedImage);
                            setShowGuidelinePopup(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md"
                          title="View Clinical Guidelines"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          View Guideline
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FiLM Contribution */}
                  {selectedImage.prediction.film_contribution && selectedImage.prediction.film_contribution.enabled && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg mb-4">
                      <p className="text-sm font-semibold mb-3">FiLM Layer Contribution</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Image</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {selectedImage.prediction.film_contribution.image_delta_l2_mean?.toFixed(4) || 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lab</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {selectedImage.prediction.film_contribution.gamma_l2_mean?.toFixed(4) || 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Clinical</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {selectedImage.prediction.film_contribution.beta_l2_mean?.toFixed(4) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Data */}
              {selectedImage.labData && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                    <FaFlask className="mr-2 text-green-600" />
                    Laboratory Values
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CRP</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.labData.CRP} mg/L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">FT4</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.labData.FT4} pmol/L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">IgE</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.labData.IgE} IU/mL</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vitamin D</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.labData.VitD} ng/mL</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Data */}
              {selectedImage.clinicalData && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                    <FaUser className="mr-2 text-purple-600" />
                    Clinical Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.Age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Diagnosed Age</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.DiagnosedAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Age First Symptoms</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.AgeFirstSymptoms} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.Weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.Height} cm</p>
                    </div>
                    {selectedImage.clinicalData.Weight && selectedImage.clinicalData.Height && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">BMI</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {(selectedImage.clinicalData.Weight / Math.pow(selectedImage.clinicalData.Height / 100, 2)).toFixed(1)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Itching Score</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedImage.clinicalData.ItchingScore}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Angioedema from Drug</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedImage.clinicalData.AngioedemaDrugQ === '0' || selectedImage.clinicalData.AngioedemaDrugQ === 0 ? 'No' : 
                         selectedImage.clinicalData.AngioedemaDrugQ === '1' || selectedImage.clinicalData.AngioedemaDrugQ === 1 ? 'Yes' : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientImageUploadPage;
