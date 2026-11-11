import { request } from './api.js';

export const boardService = {
  async getBoards() {
    return await request('/boards');
  },

  async getBoardById(id) {
    return await request(`/boards/${id}`);
  },

  async createBoard(data) {
    return await request('/boards', {
      method: 'POST',
      body: data
    });
  },

  async updateBoard(id, data) {
    return await request(`/boards/${id}`, {
      method: 'PATCH',
      body: data
    });
  },

  async deleteBoard(id) {
    return await request(`/boards/${id}`, {
      method: 'DELETE'
    });
  },

  async addMember(boardId, { userId, rol }) {
    return await request(`/boards/${boardId}/members`, {
      method: 'POST',
      body: { userId, rol }
    });
  },

  async removeMember(boardId, userId) {
    return await request(`/boards/${boardId}/members/${userId}`, {
      method: 'DELETE'
    });
  },

  async createList(boardId, data) {
    return await request(`/boards/${boardId}/lists`, {
      method: 'POST',
      body: data
    });
  },

  async updateList(listId, data) {
    return await request(`/lists/${listId}`, {
      method: 'PATCH',
      body: data
    });
  },

  async deleteList(listId) {
    return await request(`/lists/${listId}`, {
      method: 'DELETE'
    });
  }
};

export default boardService;

