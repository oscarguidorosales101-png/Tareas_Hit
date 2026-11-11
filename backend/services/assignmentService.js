import { TaskAssignment, Task, User, BoardMember } from '../models/index.js';

export const assignmentService = {
  async getAssignments(taskId) {
    return await TaskAssignment.findAll({
      where: { taskId: parseInt(taskId, 10) },
      include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
    });
  },

  async assignUser(taskId, { userId, tipo = 'responsable' }) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const error = new Error(`Tarea #${taskId} no encontrada`);
      error.status = 404;
      throw error;
    }

    const targetUserId = parseInt(userId, 10);
    const user = await User.findByPk(targetUserId);
    if (!user || user.estado !== 'activo') {
      const error = new Error('Usuario inválido o inactivo');
      error.status = 400;
      throw error;
    }

    // Regla de negocio: si la tarea pertenece a un tablero, el usuario debe ser miembro del tablero
    if (task.boardId) {
      const isMember = await BoardMember.findOne({
        where: { boardId: task.boardId, userId: targetUserId }
      });
      if (!isMember) {
        const error = new Error('El usuario no pertenece al tablero de esta tarea');
        error.status = 400;
        throw error;
      }
    }

    // Si se asigna como responsable, remover el responsable anterior
    if (tipo === 'responsable') {
      await TaskAssignment.destroy({ where: { taskId: task.id, tipo: 'responsable' } });
    }

    const [assignment, created] = await TaskAssignment.findOrCreate({
      where: { taskId: task.id, userId: targetUserId, tipo },
      defaults: { taskId: task.id, userId: targetUserId, tipo }
    });

    return await TaskAssignment.findByPk(assignment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
    });
  },

  async removeAssignment(taskId, assignmentId) {
    const assignment = await TaskAssignment.findOne({
      where: { id: parseInt(assignmentId, 10), taskId: parseInt(taskId, 10) }
    });
    if (!assignment) {
      const error = new Error('Asignación no encontrada');
      error.status = 404;
      throw error;
    }
    await assignment.destroy();
    return { message: 'Asignación eliminada exitosamente' };
  }
};

export default assignmentService;

