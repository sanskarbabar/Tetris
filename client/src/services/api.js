import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach JWT token from localStorage automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tetris_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Scores
export const saveScore = (data) => api.post('/scores', data);
export const getMyScores = (params) => api.get('/scores/me', { params });

// Leaderboard
export const getLeaderboard = (params) => api.get('/leaderboard', { params });
export const getMyRank = () => api.get('/leaderboard/me');

