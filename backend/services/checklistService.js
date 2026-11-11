import { Checklist, ChecklistItem, Task } from '../models/index.js';

export const checklistService = {
  async getChecklists(taskId) {
    return await Checklist.findAll({
      where: { taskId: parseInt(taskId, 10) },
      include: [{ model: ChecklistItem, as: 'items', order: [['posicion', 'ASC']] }]
    });
  },

  async createChecklist(taskId, { titulo = 'Checklist' }) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const error = new Error(`Tarea #${taskId} no encontrada`);
      error.status = 404;
      throw error;
    }

    return await Checklist.create({
      taskId: task.id,
      titulo: titulo.trim() || 'Checklist'
    });
  },

  async addItem(checklistId, { contenido }) {
    if (!contenido || !contenido.trim()) {
      const error = new Error('El contenido del elemento es obligatorio');
      error.status = 400;
      throw error;
    }

    const checklist = await Checklist.findByPk(checklistId);
    if (!checklist) {
      const error = new Error('Checklist no encontrado');
      error.status = 404;
      throw error;
    }

    const maxItem = await ChecklistItem.findOne({
      where: { checklistId },
      order: [['posicion', 'DESC']]
    });
    const posicion = maxItem ? maxItem.posicion + 1 : 0;

    return await ChecklistItem.create({
      checklistId,
      contenido: contenido.trim(),
      completado: false,
      posicion
    });
  },

  async updateItem(itemId, updates) {
    const item = await ChecklistItem.findByPk(itemId);
    if (!item) {
      const error = new Error('Elemento de checklist no encontrado');
      error.status = 404;
      throw error;
    }

    if (updates.completado !== undefined) item.completado = Boolean(updates.completado);
    if (updates.contenido !== undefined) item.contenido = updates.contenido.trim();
    if (updates.posicion !== undefined) item.posicion = parseInt(updates.posicion, 10);

    await item.save();
    return item;
  },

  async deleteItem(itemId) {
    const item = await ChecklistItem.findByPk(itemId);
    if (!item) {
      const error = new Error('Elemento no encontrado');
      error.status = 404;
      throw error;
    }
    const json = item.toJSON();
    await item.destroy();
    return json;
  }
};

export default checklistService;

