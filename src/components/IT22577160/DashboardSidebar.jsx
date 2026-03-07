import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaFlask,
  FaImage,
  FaPills,
  FaClipboardList,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaMicroscope
} from 'react-icons/fa';

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: FaTachometerAlt,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AURA Analyze',
      path: '/analyze',
      icon: FaMicroscope,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      name: 'Patient Profile',
      path: '/patient-profile',
      icon: FaUser,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Lab Entry',
      path: '/lab-entry',
      icon: FaFlask,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      name: 'Patient Images',
      path: '/patient-images',
      icon: FaImage,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      name: 'Drug Recommendations',
      path: '/drug-recommendations',
      icon: FaPills,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      name: 'Treatment Guidelines',
      path: '/treatment-guidelines',
      icon: FaClipboardList,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      name: 'Safety Alerts',
      path: '/safety-alerts',
      icon: FaExclamationTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hidden lg:flex`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-10"
      >
        {isCollapsed ? (
          <FaChevronRight className="text-gray-600 dark:text-gray-400" />
        ) : (
          <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Sidebar Header */}
      {/* <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Navigation
          </h2>
        )}
      </div> */}

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? `${item.bgColor} ${item.color} font-semibold`
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className={`text-xl ${isActive ? item.color : ''}`} />
              {!isCollapsed && (
                <span className="text-sm">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-current"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1">AURA Dashboard</p>
            <p>AI-Powered Medical Platform</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
