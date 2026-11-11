import { Comment, User, Task } from '../models/index.js';

export const commentService = {
  async getComments(taskId) {
    return await Comment.findAll({
      where: { taskId: parseInt(taskId, 10) },
      include: [{ model: User, as: 'author', attributes: ['id', 'nombre', 'email', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });
  },

  async addComment(taskId, { contenido }, currentUser) {
    if (!contenido || !contenido.trim()) {
      const error = new Error('El comentario no puede estar vacío');
      error.status = 400;
      throw error;
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      const error = new Error(`Tarea #${taskId} no encontrada`);
      error.status = 404;
      throw error;
    }

    const comment = await Comment.create({
      taskId: task.id,
      userId: currentUser.id,
      contenido: contenido.trim()
    });

    return await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'nombre', 'email', 'avatar'] }]
    });
  },

  async deleteComment(id, currentUser) {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      const error = new Error('Comentario no encontrado');
      error.status = 404;
      throw error;
    }

    // Solo el autor o un admin puede eliminar el comentario
    if (comment.userId !== currentUser.id && currentUser.rol !== 'admin') {
      const error = new Error('No tienes permiso para eliminar este comentario');
      error.status = 403;
      throw error;
    }

    const json = comment.toJSON();
    await comment.destroy();
    return json;
  }
};

export default commentService;

