import { request } from './api.js';

export const trelloService = {
  async getStatus() {
    return await request('/integrations/trello/status');
  },

  async getBoards() {
    return await request('/integrations/trello/boards');
  },

  async getLists(boardId) {
    return await request(`/integrations/trello/boards/${boardId}/lists`);
  },

  async getCards(listId) {
    return await request(`/integrations/trello/lists/${listId}/cards`);
  },

  async importCard({ cardId, localBoardId, localListId }) {
    return await request('/integrations/trello/import', {
      method: 'POST',
      body: { cardId, localBoardId, localListId }
    });
  }
};

export default trelloService;

