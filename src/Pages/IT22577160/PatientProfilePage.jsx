import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaIdCard, FaNotesMedical, FaPills, FaAllergies, FaEdit, FaSave } from 'react-icons/fa';

const PatientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@email.com',
    patientId: 'PT-2024-001234',
    bloodType: 'O+',
    weight: '75',
    height: '178',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    currentMedications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', startDate: '2023-01-15' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2023-03-20' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', startDate: '2023-06-10' }
    ],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    }
  });

  const handleInputChange = (field, value) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {patientData.firstName[0]}{patientData.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {patientData.firstName} {patientData.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Patient ID: {patientData.patientId}</p>
                <p className="text-gray-500 dark:text-gray-400">{calculateAge(patientData.dateOfBirth)} years old • {patientData.gender}</p>
              </div>
            </div>
            <button
              onClick={toggleEdit}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? <><FaSave /> <span>Save</span></> : <><FaEdit /> <span>Edit Profile</span></>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <FaUser className="mr-3 text-blue-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  <FaCalendar className="inline mr-2" />Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={patientData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  <FaIdCard className="inline mr-2" />Blood Type
                </label>
                {isEditing ? (
                  <select
                    value={patientData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{patientData.bloodType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  <FaPhone className="inline mr-2" />Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{patientData.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline mr-2" />Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={patientData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{patientData.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Weight (kg)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={patientData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{patientData.weight} kg</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Height (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={patientData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{patientData.height} cm</p>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FaAllergies className="mr-3 text-red-600" /> Allergies
              </h3>
              <div className="flex flex-wrap gap-2">
                {patientData.allergies.map((allergy, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <FaNotesMedical className="mr-3 text-orange-600" /> Chronic Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {patientData.chronicConditions.map((condition, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Name</label>
                <p className="text-gray-800 dark:text-gray-200">{patientData.emergencyContact.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Relationship</label>
                <p className="text-gray-800 dark:text-gray-200">{patientData.emergencyContact.relationship}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Phone</label>
                <p className="text-gray-800 dark:text-gray-200">{patientData.emergencyContact.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <FaPills className="mr-3 text-green-600" /> Current Medications
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Medication</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Dosage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Frequency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {patientData.currentMedications.map((med, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{med.name}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{med.dosage}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{med.frequency}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{new Date(med.startDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
