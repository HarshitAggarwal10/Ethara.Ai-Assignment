import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaUsers, FaClock } from 'react-icons/fa';
import { projectAPI } from '../utils/api';

export default function ProjectList({ projects, onUpdate }) {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (projectId) => {
    setLoading(projectId);
    try {
      await projectAPI.delete(projectId);
      setConfirmDelete(null);
      onUpdate();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert(err.response?.data?.message || 'Error deleting project');
    } finally {
      setLoading(null);
    }
  };

  const canEditDelete = (project) => {
    return currentUser.role === 'admin' || project.owner_id === currentUser.id;
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No projects yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div 
                className="flex-1 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{project.description}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                {canEditDelete(project) && (
                  <>
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="inline-flex items-center space-x-1 px-3 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition text-sm"
                      title="Edit project"
                    >
                      <FaEdit size={12} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(project.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1 text-red-600 bg-red-50 hover:bg-red-100 rounded transition text-sm"
                      title="Delete project"
                    >
                      <FaTrash size={12} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-gray-400" size={14} />
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="text-sm font-semibold text-gray-900">{project.member_count || 1}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-xs text-gray-500">Tasks</p>
                  <p className="text-sm font-semibold text-gray-900">{project.task_count || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-gray-400" size={14} />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Delete Modal */}
          {confirmDelete === project.id && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delete Project
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{project.name}"? This action cannot be undone and all associated tasks will be deleted.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={loading === project.id}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {loading === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
