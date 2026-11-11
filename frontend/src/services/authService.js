import { request } from './api.js';

export const authService = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (data.token) {
      localStorage.setItem('hit_token', data.token);
      localStorage.setItem('hit_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    return await request('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignorar si el token ya no era válido en el backend
    } finally {
      localStorage.removeItem('hit_token');
      localStorage.removeItem('hit_user');
    }
  },

  getStoredSession() {
    const token = localStorage.getItem('hit_token');
    const userStr = localStorage.getItem('hit_user');
    if (!token || !userStr) return null;
    try {
      return { token, user: JSON.parse(userStr) };
    } catch {
      return null;
    }
  }
};

