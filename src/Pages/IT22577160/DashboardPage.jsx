import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaFlask, 
  FaPills, 
  FaExclamationTriangle, 
  FaClipboardList,
  FaImage,
  FaChartLine,
  FaCalendar,
  FaHeartbeat,
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaMicroscope
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const DRUG_LABEL = { H1_ANTIHISTAMINE: 'H1 Antihistamine', LTRA: 'LTRA', ADVANCED_THERAPY: 'Advanced Therapy', OTHER: 'Other Therapy' };
const DRUG_COLOR = { H1_ANTIHISTAMINE: 'bg-sky-100 text-sky-700 border-sky-400', LTRA: 'bg-emerald-100 text-emerald-700 border-emerald-400', ADVANCED_THERAPY: 'bg-violet-100 text-violet-700 border-violet-400', OTHER: 'bg-amber-100 text-amber-700 border-amber-400' };

const DashboardPage = () => {
  const lastResult = (() => { try { return JSON.parse(localStorage.getItem('aura_last_result') || 'null'); } catch { return null; } })();

  const [notifications] = useState([
    { id: 1, type: 'alert', message: 'New safety alert requires attention', time: '10 mins ago' },
    { id: 2, type: 'success', message: 'Lab results uploaded successfully', time: '2 hours ago' },
    { id: 3, type: 'info', message: 'Treatment guideline updated', time: '1 day ago' }
  ]);

  // Chart Data
  const monthlyPatientData = [
    { month: 'Jan', patients: 45, treatments: 38, success: 35 },
    { month: 'Feb', patients: 52, treatments: 47, success: 42 },
    { month: 'Mar', patients: 48, treatments: 43, success: 39 },
    { month: 'Apr', patients: 61, treatments: 56, success: 51 },
    { month: 'May', patients: 58, treatments: 53, success: 48 },
    { month: 'Jun', patients: 67, treatments: 62, success: 58 }
  ];

  const treatmentDistribution = [
    { name: 'Completed', value: 156, color: '#10b981' },
    { name: 'In Progress', value: 89, color: '#3b82f6' },
    { name: 'Pending', value: 45, color: '#f59e0b' },
    { name: 'Cancelled', value: 12, color: '#ef4444' }
  ];

  const drugCategoryData = [
    { name: 'Antibiotics', value: 35, color: '#8b5cf6' },
    { name: 'Antihistamines', value: 28, color: '#06b6d4' },
    { name: 'Corticosteroids', value: 22, color: '#ec4899' },
    { name: 'Immunosuppressants', value: 15, color: '#f97316' }
  ];

  const labTestTrends = [
    { week: 'Week 1', CBC: 24, Lipid: 18, Metabolic: 15 },
    { week: 'Week 2', CBC: 28, Lipid: 22, Metabolic: 19 },
    { week: 'Week 3', CBC: 31, Lipid: 25, Metabolic: 21 },
    { week: 'Week 4', CBC: 35, Lipid: 28, Metabolic: 24 }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  const DRUG_COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

  const quickStats = [
    { label: 'Active Patients', value: '24', icon: FaUser, color: 'blue', link: '/patient-profile' },
    { label: 'Pending Lab Results', value: '5', icon: FaFlask, color: 'purple', link: '/lab-entry' },
    { label: 'Safety Alerts', value: '3', icon: FaExclamationTriangle, color: 'red', link: '/safety-alerts' },
    { label: 'Drug Recommendations', value: '8', icon: FaPills, color: 'green', link: '/drug-recommendations' }
  ];

  const recentActivity = [
    { id: 1, action: 'Lab results entered', patient: 'John Doe', time: '30 mins ago', type: 'lab' },
    { id: 2, action: 'Drug recommendation approved', patient: 'Jane Smith', time: '1 hour ago', type: 'drug' },
    { id: 3, action: 'Patient image uploaded', patient: 'Michael Brown', time: '2 hours ago', type: 'image' },
    { id: 4, action: 'Guideline step completed', patient: 'Sarah Johnson', time: '3 hours ago', type: 'guideline' }
  ];

  const upcomingTasks = [
    { id: 1, task: 'Review lab results for PT-2024-001234', priority: 'high', due: 'Today, 3:00 PM' },
    { id: 2, task: 'Follow-up consultation scheduled', priority: 'medium', due: 'Tomorrow, 10:00 AM' },
    { id: 3, task: 'Update treatment guidelines', priority: 'low', due: 'Dec 10, 2024' }
  ];

  const quickActions = [
    { name: 'Patient Profile', icon: FaUser, link: '/patient-profile', color: 'blue' },
    { name: 'Lab Entry', icon: FaFlask, link: '/lab-entry', color: 'purple' },
    { name: 'Upload Images', icon: FaImage, link: '/patient-images', color: 'pink' },
    { name: 'Drug Recommendations', icon: FaPills, link: '/drug-recommendations', color: 'green' },
    { name: 'Treatment Guidelines', icon: FaClipboardList, link: '/treatment-guidelines', color: 'indigo' },
    { name: 'Safety Alerts', icon: FaExclamationTriangle, link: '/safety-alerts', color: 'red' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lab': return <FaFlask className="text-purple-600" />;
      case 'drug': return <FaPills className="text-green-600" />;
      case 'image': return <FaImage className="text-pink-600" />;
      case 'guideline': return <FaClipboardList className="text-indigo-600" />;
      default: return <FaCheckCircle className="text-blue-600" />;
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Medical Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back! Here's what's happening with your patients today.
          </p>
        </div>

        {/* ── AURA Last Analysis / CTA ─────────────────────────────────── */}
        {lastResult ? (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-600 text-white rounded-xl p-3 shadow">
                <FaMicroscope size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Last AURA Analysis</p>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${DRUG_COLOR[lastResult.predicted_drug_group] || DRUG_COLOR.OTHER}`}>
                    {DRUG_LABEL[lastResult.predicted_drug_group] || lastResult.predicted_drug_group}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Confidence: <strong className="text-gray-800 dark:text-white">{Math.round(lastResult.confidence * 100)}%</strong>
                  </span>
                  {lastResult.mapped_guideline_step && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Step: <strong className="text-gray-800 dark:text-white">{lastResult.mapped_guideline_step?.replace('_', ' ')}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {lastResult._patientName && lastResult._patientName !== 'Anonymous' ? `${lastResult._patientName} · ` : ''}
                  {lastResult._ts ? new Date(lastResult._ts).toLocaleString() : ''}
                </p>
              </div>
            </div>
            <Link to="/analyze" className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition-all hover:shadow-indigo-400/40 flex items-center gap-2">
              <FaMicroscope size={13} /><span>Analyze Again</span>
            </Link>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <p className="text-white font-bold text-lg mb-0.5">Run Your First AURA Analysis</p>
              <p className="text-blue-200 text-sm">Upload a CSU skin photo and lab values to get an AI-powered drug recommendation.</p>
            </div>
            <Link to="/analyze" className="flex-shrink-0 px-6 py-3 bg-white text-indigo-700 rounded-lg text-sm font-extrabold shadow hover:shadow-xl transition-all flex items-center gap-2">
              <FaMicroscope size={14} /><span>Open AURA Analyze</span>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-l-4 border-${stat.color}-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`bg-${stat.color}-100 dark:bg-${stat.color}-900/30 p-4 rounded-full`}>
                    <stat.icon className={`text-2xl text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FaBell className="mr-3 text-yellow-600" />
                  Notifications
                </h2>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-semibold">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div className={`p-2 rounded-full ${
                      notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                      notif.type === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notif.type === 'alert' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-white font-medium">{notif.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <FaCalendar className="mr-3 text-blue-600" />
                Tasks
              </h2>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white font-medium mb-2">{task.task}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaCalendar className="mr-2" />
                      {task.due}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer">
                  <div className={`bg-${action.color}-100 dark:bg-${action.color}-900/30 p-4 rounded-full mb-3`}>
                    <action.icon className={`text-2xl text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white text-center">
                    {action.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <FaChartLine className="mr-3 text-green-600" />
              Recent Activity
            </h2>
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-semibold flex items-center">
              View All <FaArrowRight className="ml-2" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Patient: {activity.patient}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Bar Chart - Monthly Patient Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Monthly Patient Statistics
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPatientData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Bar dataKey="patients" fill="#3b82f6" name="Total Patients" />
                <Bar dataKey="treatments" fill="#8b5cf6" name="Treatments" />
                <Bar dataKey="success" fill="#10b981" name="Successful" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Treatment Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Treatment Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={treatmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {treatmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {treatmentDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart - Lab Test Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Lab Test Trends (Last 4 Weeks)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={labTestTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="CBC" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Complete Blood Count"
                />
                <Line 
                  type="monotone" 
                  dataKey="Lipid" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  name="Lipid Panel"
                />
                <Line 
                  type="monotone" 
                  dataKey="Metabolic" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  name="Metabolic Panel"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Drug Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Drug Category Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={drugCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {drugCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {drugCategoryData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Patient Satisfaction</h3>
              <FaHeartbeat className="text-3xl opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">94%</p>
            <p className="text-blue-100 text-sm">+5% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Treatment Success</h3>
              <FaCheckCircle className="text-3xl opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">87%</p>
            <p className="text-green-100 text-sm">+3% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Avg Response Time</h3>
              <FaCalendar className="text-3xl opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">2.4h</p>
            <p className="text-purple-100 text-sm">-0.5h from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
