import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ProjectList({ projects, onUpdate }) {
  const navigate = useNavigate();

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/api/projects/${projectId}`);
        onUpdate();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No projects yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/projects/${project.id}`)}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{project.description}</p>
            </div>
            <button
              onClick={(e) => handleDelete(project.id, e)}
              className="text-red-600 hover:text-red-800 text-sm ml-2"
            >
              Delete
            </button>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Members: <span className="font-semibold">{project.team_members || 0}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Created: {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
