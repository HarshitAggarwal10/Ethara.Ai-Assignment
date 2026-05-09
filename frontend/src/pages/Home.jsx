import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (token) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Task Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Team Task Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize, collaborate, and track your projects with ease. Built for teams that want to get things done.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600">View all your tasks and projects in one place with real-time statistics.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Manage team members, assign tasks, and track project progress together.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-3xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Tracking</h3>
            <p className="text-gray-600">Create, assign, and monitor tasks with priorities and due dates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
