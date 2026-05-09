import React from 'react';
import api from '../utils/api';

export default function TaskList({ tasks, onUpdate }) {
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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <p className="text-gray-600 mt-2">{task.description}</p>
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Assigned to: {task.assigned_to}</p>
              <p className="text-sm text-gray-600">Due: {new Date(task.due_date).toLocaleDateString()}</p>
            </div>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getStatusColor(task.status)}`}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
