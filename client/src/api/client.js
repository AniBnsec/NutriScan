import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`,
  timeout: 60000,
});

// Token getter — set by ClerkAuthBridge once Clerk is ready
let _getClerkToken = null;
export const setClerkTokenGetter = (fn) => { _getClerkToken = fn; };

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    if (_getClerkToken) {
      const token = await _getClerkToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    }
  } catch (e) {}

  // Fallback to localStorage token (for non-Clerk / legacy auth)
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default api;
