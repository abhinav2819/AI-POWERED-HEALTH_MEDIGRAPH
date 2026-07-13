import axios from 'axios';

const SPRING_BOOT_URL = process.env.REACT_APP_SPRING_BOOT_URL || 'http://localhost:8080/api/health/v1';
const FASTAPI_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Spring Boot API Client (for core health features)
export const springApi = axios.create({
  baseURL: SPRING_BOOT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FastAPI Client (for AI, WhatsApp, Payments)
export const fastApi = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
springApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

fastApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
  signup: (data) => springApi.post('/auth/signup', data),
  login: (data) => springApi.post('/auth/login', data),
  refresh: (refreshToken) => springApi.post('/auth/refresh', { refreshToken }),
};

// User Profile API
export const userApi = {
  getProfile: () => springApi.get('/user/profile'),
  completeProfile: (data) => springApi.put('/user/profile/complete', data),
  updateProfile: (data) => springApi.patch('/user/profile_update', data),
  createGoal: (data) => springApi.post('/user/new_goal', data),
  getGoals: () => springApi.get('/user/goals'),
  updateGoals: (data) => springApi.patch('/user/update_goals', data),
};

// Health Metrics API
export const metricsApi = {
  postManual: (data) => springApi.post('/metric/post/manual', data),
  postExternal: (source, data) => springApi.post(`/metric/post/external/${source}`, data),
  getAllMetrics: () => springApi.get('/metric/get/allmetric'),
  getByType: (type) => springApi.get(`/metric/get/metrictype/${type}`),
  getByRange: (start, end) => springApi.get('/metric/get/range', { params: { start, end } }),
  getAggregate: (params) => springApi.get('/metric/get/aggregate', { params }),
  getHistory: (params) => springApi.get('/metric/get/history', { params }),
};

// Analytics API
export const analyticsApi = {
  getBMI: () => springApi.get('/analytics/bmi'),
  getProgress: () => springApi.get('/analytics/progress'),
};

// Admin API
export const adminApi = {
  getUsers: () => springApi.get('/admin/users'),
  getUser: (id) => springApi.get(`/admin/users/${id}`),
  deleteUser: (id) => springApi.delete(`/admin/users/${id}`),
  getAnalytics: () => springApi.get('/admin/analytics'),
  updateUserRole: (id, role) => springApi.put(`/admin/users/${id}/role`, { role }),
  getAuditLogs: () => springApi.get('/admin/audit'),
};

// AI Coach API (FastAPI)
export const aiApi = {
  chat: (message, sessionId) => fastApi.post('/ai-coach/chat', { message, session_id: sessionId }),
  getHistory: (sessionId) => fastApi.get(`/ai-coach/history/${sessionId}`),
};

// WhatsApp API (FastAPI)
export const whatsappApi = {
  sendReport: (data) => fastApi.post('/whatsapp/send-report', data),
};

// Payment API (FastAPI)
export const paymentApi = {
  createOrder: (data) => fastApi.post('/payments/create-order', data),
  verifyPayment: (data) => fastApi.post('/payments/verify', data),
};

// Products API (FastAPI)
export const productsApi = {
  getAll: () => fastApi.get('/products'),
  getById: (id) => fastApi.get(`/products/${id}`),
};