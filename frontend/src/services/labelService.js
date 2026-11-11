import { request } from './api.js';

export const labelService = {
  async getLabels() {
    return await request('/labels');
  },

  async createLabel(data) {
    return await request('/labels', {
      method: 'POST',
      body: data
    });
  }
};

export default labelService;

