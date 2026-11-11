import { request } from './api.js';

export const userService = {
  async getUsers() {
    return await request('/users');
  }
};

