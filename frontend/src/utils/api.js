import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  verify: () => api.get('/api/auth/verify'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

// User API
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/me/profile', data),
  updatePassword: (data) => api.put('/api/users/me/password', data),
  search: (query) => api.get('/api/users/search', { params: { q: query } }),
  statistics: () => api.get('/api/users/statistics'),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// Project API
export const projectAPI = {
  getAll: () => api.get('/api/projects'),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  getStats: (id) => api.get(`/api/projects/${id}/stats`),
};

// Team/Members API
export const teamAPI = {
  getMembers: (projectId) => api.get(`/api/team/projects/${projectId}/members`),
  addMember: (projectId, userId) => api.post(`/api/team/projects/${projectId}/members`, { user_id: userId }),
  removeMember: (projectId, memberId) => api.delete(`/api/team/projects/${projectId}/members/${memberId}`),
  getMember: (projectId, memberId) => api.get(`/api/team/projects/${projectId}/members/${memberId}`),
};

// Task API
export const taskAPI = {
  getAll: () => api.get('/api/tasks'),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;
