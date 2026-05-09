import React, { useState } from 'react';
import api from '../utils/api';

export default function TaskFilter({ tasks, onUpdate }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/api/tasks/${taskId}`);
        onUpdate();
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No tasks match the selected filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Assigned to: <span className="font-medium">{task.assigned_to}</span></p>
                  {task.due_date && (
                    <p>Due: <span className="font-medium">{new Date(task.due_date).toLocaleDateString()}</span></p>
                  )}
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="px-3 py-1 rounded text-sm font-medium border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
