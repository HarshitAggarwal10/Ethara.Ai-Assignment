import React from 'react';

export default function DashboardStats({ tasks, projects }) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div className="text-4xl text-blue-200">⚡</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
          </div>
          <div className="text-4xl text-blue-200">▶</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
          </div>
          <div className="text-4xl text-green-200">✓</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Overdue</p>
            <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
          </div>
          <div className="text-4xl text-red-200">!</div>
        </div>
      </div>
    </div>
  );
}
