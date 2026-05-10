import React from 'react';
import { FaCheckCircle, FaClock, FaHourglassEnd, FaTasks } from 'react-icons/fa';

export default function ProgressTracker({ tasks = [] }) {
  if (tasks.length === 0) {
    return null;
  }

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  
  const progressPercentage = Math.round((completed / tasks.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaTasks className="text-blue-600" />
        Progress Tracking
      </h2>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Completion</span>
          <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
            <FaCheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
            </div>
            <FaClock className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <FaHourglassEnd className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdue}</p>
            </div>
            <FaTasks className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{completed}</span> out of{' '}
          <span className="font-semibold">{tasks.length}</span> tasks completed
        </p>
      </div>
    </div>
  );
}
