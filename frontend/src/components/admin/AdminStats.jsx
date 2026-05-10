import React from 'react';
import { FaChartBar, FaCheckCircle, FaClock, FaTasks, FaUsers, FaFolder } from 'react-icons/fa';

export default function AdminStats({ stats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <FaUsers className="text-2xl text-blue-600 opacity-50" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold text-gray-900">{stats.users.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-red-50 rounded p-2">
                <p className="text-xs text-gray-600">Admins</p>
                <p className="text-xl font-bold text-red-600">{stats.users.admins}</p>
              </div>
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs text-gray-600">Members</p>
                <p className="text-xl font-bold text-green-600">{stats.users.members}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 pt-2">
              Active: {stats.users.active} ({Math.round((stats.users.active / stats.users.total) * 100)}%)
            </div>
          </div>
        </div>

        {/* Projects Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <FaFolder className="text-2xl text-purple-600 opacity-50" />
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-bold text-gray-900">{stats.projects.total}</div>
            <p className="text-gray-600">Total Projects</p>
            <div className="bg-purple-50 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-600">Average per Admin</p>
              <p className="text-lg font-bold text-purple-600">
                {stats.users.admins > 0 ? (stats.projects.total / stats.users.admins).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Progress</h3>
            <FaTasks className="text-2xl text-green-600 opacity-50" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">{stats.tasks.completion_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: `${stats.tasks.completion_rate}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 pt-2">
              {stats.tasks.completed} of {stats.tasks.total} tasks completed
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-xl text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.tasks.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaClock className="text-xl text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.tasks.in_progress}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaTasks className="text-xl text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.tasks.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaChartBar className="text-xl text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.tasks.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
