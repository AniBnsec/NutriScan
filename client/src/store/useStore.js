import { create } from 'zustand';
import api from '../api/client';

const safeGetJSON = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined') return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
};

const safeGetItem = (key, fallback = null) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    return fallback;
  }
};

const useStore = create((set, get) => ({
  // ── Auth ───────────────────────────────────────────────
  user: safeGetJSON('user', null),
  token: safeGetItem('token'),
  isAuthenticated: !!safeGetItem('token'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isAuthenticated: true });
    return data.user;
  },

  register: async (name, email, password, calorieGoal) => {
    const { data } = await api.post('/auth/register', { name, email, password, calorieGoal });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isAuthenticated: true });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false, todayData: null, meals: [], weeklyData: null, stats: null });
  },

  updateProfile: async (updates) => {
    const { data } = await api.patch('/auth/profile', updates);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },

  // ── Scanner ────────────────────────────────────────────
  scanResult: null,
  scanLoading: false,

  scanFood: async (file) => {
    set({ scanLoading: true, scanResult: null });
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/meals/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ scanResult: data, scanLoading: false });
      return data;
    } catch (e) {
      set({ scanLoading: false });
      throw e;
    }
  },

  clearScan: () => set({ scanResult: null }),

  saveMeal: async (mealData) => {
    const { data } = await api.post('/meals', mealData);
    return data.meal;
  },

  saveManualMeal: async (mealData) => {
    const { data } = await api.post('/meals/manual', mealData);
    return data.meal;
  },

  // ── Meals / History ────────────────────────────────────
  meals: [],
  mealsLoading: false,
  mealsTotal: 0,

  fetchMeals: async (page = 1, date = '') => {
    set({ mealsLoading: true });
    const { data } = await api.get('/meals', { params: { page, limit: 20, date } });
    set({ meals: data.meals, mealsTotal: data.total, mealsLoading: false });
    return data;
  },

  deleteMeal: async (id) => {
    await api.delete(`/meals/${id}`);
    set(s => ({ meals: s.meals.filter(m => m._id !== id) }));
  },

  // ── Dashboard ──────────────────────────────────────────
  todayData: null,
  weeklyData: null,
  stats: null,
  dashLoading: false,

  fetchToday: async () => {
    set({ dashLoading: true });
    try {
      const [todayRes, weeklyRes, statsRes] = await Promise.all([
        api.get('/dashboard/today'),
        api.get('/dashboard/weekly'),
        api.get('/dashboard/stats'),
      ]);
      set({ todayData: todayRes.data, weeklyData: weeklyRes.data, stats: statsRes.data, dashLoading: false });
    } catch {
      set({ dashLoading: false });
    }
  },

  // ── Water Tracking ─────────────────────────────────────
  updateWater: async (amount) => {
    const { data } = await api.put('/dashboard/water', { amount });
    set(s => ({
      todayData: s.todayData ? { ...s.todayData, water: data.water } : s.todayData,
    }));
    return data.water;
  },
}));

export default useStore;
