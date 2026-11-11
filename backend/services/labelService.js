import { Label, Task } from '../models/index.js';

export const labelService = {
  async getAllLabels() {
    return await Label.findAll({ order: [['nombre', 'ASC']] });
  },

  async createLabel(data) {
    if (!data.nombre || !data.nombre.trim()) {
      const error = new Error('El nombre de la etiqueta es obligatorio');
      error.status = 400;
      throw error;
    }

    return await Label.create({
      nombre: data.nombre.trim(),
      color: data.color || '#3b82f6',
      descripcion: data.descripcion || ''
    });
  },

  async attachLabel(taskId, labelId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.status = 404;
      throw error;
    }
    await task.addLabel(labelId);
    return await task.getLabels();
  },

  async detachLabel(taskId, labelId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const error = new Error('Tarea no encontrada');
      error.status = 404;
      throw error;
    }
    await task.removeLabel(labelId);
    return await task.getLabels();
  }
};

export default labelService;

