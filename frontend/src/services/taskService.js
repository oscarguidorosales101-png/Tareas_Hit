import { request } from './api.js';

export const taskService = {
  async getTasks({ search = '', estado = '', prioridad = '', boardId = '', listId = '', isArchived = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (estado && estado !== 'todos') params.append('estado', estado);
    if (prioridad && prioridad !== 'todas') params.append('prioridad', prioridad);
    if (boardId) params.append('boardId', boardId);
    if (listId) params.append('listId', listId);
    if (isArchived !== '') params.append('isArchived', isArchived);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/tasks${queryString}`);
  },

  async getTaskById(id) {
    return await request(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return await request('/tasks', {
      method: 'POST',
      body: taskData
    });
  },

  async updateTask(id, taskData) {
    return await request(`/tasks/${id}`, {
      method: 'PATCH',
      body: taskData
    });
  },

  async completeTask(id) {
    return await request(`/tasks/${id}/complete`, {
      method: 'PATCH'
    });
  },

  async restoreTask(id) {
    return await request(`/tasks/${id}/restore`, {
      method: 'PATCH'
    });
  },

  async archiveTask(id, isArchived = true) {
    return await request(`/tasks/${id}/archive`, {
      method: 'PATCH',
      body: { isArchived }
    });
  },

  async moveTask(id, { listId, posicion }) {
    return await request(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: { listId, posicion }
    });
  },

  async deleteTask(id) {
    return await request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Asignaciones
  async getAssignments(taskId) {
    return await request(`/tasks/${taskId}/assignments`);
  },

  async assignUser(taskId, { userId, tipo }) {
    return await request(`/tasks/${taskId}/assignments`, {
      method: 'POST',
      body: { userId, tipo }
    });
  },

  async removeAssignment(taskId, assignmentId) {
    return await request(`/tasks/${taskId}/assignments/${assignmentId}`, {
      method: 'DELETE'
    });
  },

  // Comentarios
  async getComments(taskId) {
    return await request(`/tasks/${taskId}/comments`);
  },

  async addComment(taskId, contenido) {
    return await request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { contenido }
    });
  },

  async deleteComment(commentId) {
    return await request(`/comments/${commentId}`, {
      method: 'DELETE'
    });
  },

  // Checklists
  async getChecklists(taskId) {
    return await request(`/tasks/${taskId}/checklists`);
  },

  async createChecklist(taskId, titulo) {
    return await request(`/tasks/${taskId}/checklists`, {
      method: 'POST',
      body: { titulo }
    });
  },

  async addChecklistItem(checklistId, contenido) {
    return await request(`/checklists/${checklistId}/items`, {
      method: 'POST',
      body: { contenido }
    });
  },

  async updateChecklistItem(itemId, updates) {
    return await request(`/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: updates
    });
  },

  async deleteChecklistItem(itemId) {
    return await request(`/checklist-items/${itemId}`, {
      method: 'DELETE'
    });
  },

  // Etiquetas
  async attachLabel(taskId, labelId) {
    return await request(`/tasks/${taskId}/labels`, {
      method: 'POST',
      body: { labelId }
    });
  },

  async detachLabel(taskId, labelId) {
    return await request(`/tasks/${taskId}/labels/${labelId}`, {
      method: 'DELETE'
    });
  }
};

export default taskService;
