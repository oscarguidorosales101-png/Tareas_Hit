import { request } from './api.js';

export const historyService = {
  async getHistory({ search = '', estado = '', usuario = '', page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (estado && estado !== 'todos') params.append('estado', estado);
    if (usuario) params.append('usuario', usuario);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/history${queryString}`);
  },

  async getCompletedHistory({
    search = '',
    responsable = '',
    boardId = '',
    prioridad = '',
    filterDate = '',
    startDate = '',
    endDate = '',
    sortBy = 'fechaFinalizacion',
    order = 'DESC',
    page = 1,
    limit = 10
  } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (responsable) params.append('responsable', responsable);
    if (boardId) params.append('boardId', boardId);
    if (prioridad && prioridad !== 'todas') params.append('prioridad', prioridad);
    if (filterDate) params.append('filterDate', filterDate);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/history/completed${queryString}`);
  }
};

export default historyService;
