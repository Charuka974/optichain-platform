import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, PredictionInput, PredictionResult, PredictionHistoryItem } from './types';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('optichain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),
};

// ─── Predictions ─────────────────────────────────────────────────────────────
export const predictAPI = {
  predict: (data: PredictionInput): Promise<PredictionResult> =>
    api.post<PredictionResult>('/api/predict', data).then((r) => r.data),

  getHistory: (): Promise<PredictionHistoryItem[]> =>
    api.get<PredictionHistoryItem[]>('/api/predictions/history').then((r) => r.data),
};

export default api;
