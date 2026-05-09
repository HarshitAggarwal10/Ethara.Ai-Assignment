import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/tasks'),
        api.get('/api/users'),
      ]);
      
      const proj = projectsRes.data.find(p => p.id === parseInt(projectId));
      setProject(proj);
      
      const tasks = tasksRes.data.filter(t => t.project_id === parseInt(projectId));
      setProjectTasks(tasks);
      
      setAllUsers(usersRes.data);
      setMembers(usersRes.data.slice(0, proj?.team_members || 0));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
            >
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{projectTasks.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{project.team_members || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="text-sm text-gray-900 mt-2">{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
              </div>
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <p className="text-gray-500">No tasks in this project yet.</p>
                ) : (
                  projectTasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded p-3">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-600">{task.status}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Member
                </button>
              </div>
              
              {showAddMember && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select a member</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-gray-500">No team members yet.</p>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="border border-gray-200 rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{member.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
