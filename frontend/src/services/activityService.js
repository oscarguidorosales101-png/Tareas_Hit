import { request } from './api.js';

export const activityService = {
  async getLogs() {
    return await request('/logs');
  }
};

