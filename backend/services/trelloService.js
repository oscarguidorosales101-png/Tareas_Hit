import { taskService } from './taskService.js';

const TRELLO_BASE = 'https://api.trello.com/1';

export const trelloService = {
  isConfigured() {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    return Boolean(key && token && key.trim() !== '' && token.trim() !== '');
  },

  getStatus() {
    const configured = this.isConfigured();
    return {
      configured,
      message: configured
        ? 'Integración con Trello configurada y lista'
        : 'Integración no configurada. Agrega TRELLO_API_KEY y TRELLO_TOKEN en el archivo .env del backend.'
    };
  },

  getAuthQuery() {
    if (!this.isConfigured()) {
      const error = new Error('Integración de Trello no configurada en las variables de entorno.');
      error.status = 400;
      throw error;
    }
    return `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;
  },

  async getBoards() {
    if (!this.isConfigured()) return [];
    const url = `${TRELLO_BASE}/members/me/boards?${this.getAuthQuery()}&fields=name,desc,id`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error de Trello API: ${res.statusText}`);
    }
    return await res.json();
  },

  async getLists(boardId) {
    if (!this.isConfigured()) return [];
    const url = `${TRELLO_BASE}/boards/${boardId}/lists?${this.getAuthQuery()}&fields=name,id,pos`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error de Trello API: ${res.statusText}`);
    }
    return await res.json();
  },

  async getCards(listId) {
    if (!this.isConfigured()) return [];
    const url = `${TRELLO_BASE}/lists/${listId}/cards?${this.getAuthQuery()}&fields=name,desc,due,id`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error de Trello API: ${res.statusText}`);
    }
    return await res.json();
  },

  async importCard(cardId, localBoardId, localListId, currentUser) {
    if (!this.isConfigured()) {
      const error = new Error('Trello no configurado');
      error.status = 400;
      throw error;
    }

    const url = `${TRELLO_BASE}/cards/${cardId}?${this.getAuthQuery()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`No se pudo obtener la tarjeta de Trello: ${res.statusText}`);
    }

    const card = await res.json();

    const created = await taskService.createTask(
      {
        titulo: card.name,
        descripcion: card.desc ? `${card.desc}\n\n[Importado desde Trello: ${card.id}]` : '[Importado desde Trello]',
        prioridad: 'media',
        boardId: localBoardId,
        listId: localListId,
        fechaLimite: card.due ? card.due.split('T')[0] : null
      },
      currentUser
    );

    return created;
  }
};

export default trelloService;

