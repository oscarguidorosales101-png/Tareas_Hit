import { request } from './api.js';

export const statsService = {
  async getDashboardStats() {
    return await request('/stats/dashboard');
  }
};

export default statsService;

