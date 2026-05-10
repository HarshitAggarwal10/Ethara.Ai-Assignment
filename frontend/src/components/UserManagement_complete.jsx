import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaCheckCircle, FaShield, FaUser } from 'react-icons/fa';
import { userAPI } from '../utils/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('member');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userAPI.getAll();
      setUsers(response.data.data || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, role) => {
    if (userId === currentUser.id) {
      setError('Cannot change your own role');
      return;
    }

    try {
      setError('');
      await userAPI.updateRole(userId, role);
      setEditingUser(null);
      setNewRole('member');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      setError('Cannot delete your own account');
      return;
    }

    try {
      setError('');
      await userAPI.deleteUser(userId);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {users.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    {editingUser?.id === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <FaShield size={12} />
                            <span>Admin</span>
                          </>
                        ) : (
                          <>
                            <FaUser size={12} />
                            <span>Member</span>
                          </>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <FaCheckCircle className="text-green-500" title="Active" />
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {user.id === currentUser.id ? (
                      <span className="text-gray-400 text-sm">(You)</span>
                    ) : editingUser?.id === user.id ? (
                      <>
                        <button
                          onClick={() => handleChangeRole(user.id, newRole)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setNewRole('member');
                          }}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FaEdit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <FaTrash size={12} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
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
  );
}
