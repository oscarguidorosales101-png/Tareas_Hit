import {
  Task,
  User,
  Board,
  List,
  TaskAssignment,
  Label,
  Comment,
  Checklist,
  ChecklistItem,
  ActivityLog,
  TaskHistory
} from '../models/index.js';
import { Op } from 'sequelize';
import { historyService } from './historyService.js';
import { activityService } from './activityService.js';

const enrichTask = (taskInstance) => {
  if (!taskInstance) return null;
  const task = taskInstance.toJSON ? taskInstance.toJSON() : taskInstance;

  // Responsable principal
  const mainAssignment = task.assignments?.find(a => a.tipo === 'responsable');
  const mainUser = mainAssignment?.user || task.creator;
  const colaboradores = task.assignments?.filter(a => a.tipo === 'colaborador').map(a => a.user) || [];

  return {
    ...task,
    responsable: mainUser ? mainUser.nombre : 'Sin asignar',
    responsableId: mainUser ? mainUser.id : null,
    responsableEmail: mainUser ? mainUser.email : '',
    responsableAvatar: mainUser ? mainUser.avatar : '',
    colaboradores,
    completadoPor: task.completer ? task.completer.nombre : null,
    labels: task.labels || [],
    checklists: task.checklists || [],
    comments: task.comments || []
  };
};

export const taskService = {
  async getAllTasks({ search, estado, prioridad, boardId, listId, isArchived } = {}) {
    const where = {};

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { titulo: { [Op.like]: term } },
        { descripcion: { [Op.like]: term } }
      ];
    }

    if (estado && estado.trim() && estado !== 'todos') {
      where.estado = estado.trim().toLowerCase();
    }

    if (prioridad && prioridad.trim() && prioridad !== 'todas') {
      where.prioridad = prioridad.trim().toLowerCase();
    }

    if (boardId) {
      where.boardId = parseInt(boardId, 10);
    }

    if (listId) {
      where.listId = parseInt(listId, 10);
    }

    if (isArchived !== undefined) {
      where.isArchived = isArchived === 'true' || isArchived === true;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: User, as: 'completer', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: Board, as: 'board', attributes: ['id', 'nombre', 'color'] },
        { model: List, as: 'list', attributes: ['id', 'nombre', 'color', 'posicion'] },
        {
          model: TaskAssignment,
          as: 'assignments',
          include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
        },
        { model: Label, as: 'labels', through: { attributes: [] } },
        {
          model: Checklist,
          as: 'checklists',
          include: [{ model: ChecklistItem, as: 'items' }]
        },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'nombre', 'email', 'avatar'] }]
        }
      ],
      order: [
        ['posicion', 'ASC'],
        ['id', 'DESC']
      ]
    });

    return tasks.map(enrichTask);
  },

  async getTaskById(id) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: User, as: 'completer', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: Board, as: 'board' },
        { model: List, as: 'list' },
        {
          model: TaskAssignment,
          as: 'assignments',
          include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
        },
        { model: Label, as: 'labels', through: { attributes: [] } },
        {
          model: Checklist,
          as: 'checklists',
          include: [{ model: ChecklistItem, as: 'items' }]
        },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'nombre', 'email', 'avatar'] }]
        }
      ]
    });

    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    return enrichTask(task);
  },

  async createTask(data, currentUser) {
    const now = new Date();

    // Obtener tablero por defecto si no se especificó
    let targetBoardId = data.boardId ? parseInt(data.boardId, 10) : null;
    let targetListId = data.listId ? parseInt(data.listId, 10) : null;

    if (!targetBoardId) {
      const defaultBoard = await Board.findOne({ order: [['id', 'ASC']] });
      if (defaultBoard) targetBoardId = defaultBoard.id;
    }

    if (targetBoardId && !targetListId) {
      const firstList = await List.findOne({
        where: { boardId: targetBoardId },
        order: [['posicion', 'ASC']]
      });
      if (firstList) targetListId = firstList.id;
    }

    // Calcular posición máxima
    let posicion = 0;
    if (targetListId) {
      const lastTask = await Task.findOne({
        where: { listId: targetListId },
        order: [['posicion', 'DESC']]
      });
      if (lastTask) posicion = lastTask.posicion + 1;
    }

    const newTask = await Task.create({
      titulo: data.titulo.trim(),
      descripcion: data.descripcion ? data.descripcion.trim() : '',
      prioridad: data.prioridad || 'media',
      estado: data.estado || 'pendiente',
      color: data.color || '#3b82f6',
      fechaCreacion: now,
      fechaActualizacion: now,
      fechaLimite: data.fechaLimite || null,
      boardId: targetBoardId,
      listId: targetListId,
      usuarioId: currentUser.id,
      posicion
    });

    // Asignar responsable (por defecto el creador o el ID indicado)
    const assignedUserId = data.responsableId ? parseInt(data.responsableId, 10) : currentUser.id;
    await TaskAssignment.create({
      taskId: newTask.id,
      userId: assignedUserId,
      tipo: 'responsable'
    });

    // Asignar etiquetas si se enviaron
    if (Array.isArray(data.labelIds) && data.labelIds.length > 0) {
      await newTask.setLabels(data.labelIds);
    }

    // Registrar en Historial
    await historyService.recordHistory({
      tareaId: newTask.id,
      tarea: newTask.titulo,
      estadoAnterior: 'ninguno',
      estadoNuevo: newTask.estado,
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      motivo: 'Creación de tarea'
    });

    // Registrar en Actividad
    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'CREAR TAREA',
      recurso: 'POST /api/tasks',
      recursoId: newTask.id,
      metodo: 'POST',
      codigoHttp: 201,
      detalles: `Tarea creada: "${newTask.titulo}" (ID: ${newTask.id})`
    });

    return await this.getTaskById(newTask.id);
  },

  async updateTask(id, updates, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    const previousStatus = task.estado;

    if (updates.titulo !== undefined) task.titulo = updates.titulo.trim();
    if (updates.descripcion !== undefined) task.descripcion = updates.descripcion.trim();
    if (updates.prioridad !== undefined) task.prioridad = updates.prioridad;
    if (updates.color !== undefined) task.color = updates.color;
    if (updates.fechaLimite !== undefined) task.fechaLimite = updates.fechaLimite;
    if (updates.boardId !== undefined) task.boardId = updates.boardId;
    if (updates.listId !== undefined) task.listId = updates.listId;
    if (updates.posicion !== undefined) task.posicion = updates.posicion;

    if (updates.estado !== undefined && updates.estado !== previousStatus) {
      task.estado = updates.estado;
      if (updates.estado === 'completada') {
        task.fechaFinalizacion = new Date();
        task.completedBy = currentUser.id;
      } else {
        task.fechaFinalizacion = null;
        task.completedBy = null;
      }

      await historyService.recordHistory({
        tareaId: task.id,
        tarea: task.titulo,
        estadoAnterior: previousStatus,
        estadoNuevo: task.estado,
        usuario: currentUser.nombre,
        usuarioId: currentUser.id,
        motivo: 'Actualización de estado de la tarea'
      });
    }

    task.fechaActualizacion = new Date();
    await task.save();

    // Actualizar responsable si se envió
    if (updates.responsableId) {
      await TaskAssignment.destroy({ where: { taskId: task.id, tipo: 'responsable' } });
      await TaskAssignment.create({
        taskId: task.id,
        userId: parseInt(updates.responsableId, 10),
        tipo: 'responsable'
      });
    }

    // Actualizar etiquetas si se enviaron
    if (Array.isArray(updates.labelIds)) {
      await task.setLabels(updates.labelIds);
    }

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'EDITAR TAREA',
      recurso: `PATCH /api/tasks/${id}`,
      recursoId: task.id,
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: `Tarea actualizada: "${task.titulo}"`
    });

    return await this.getTaskById(task.id);
  },

  async completeTask(id, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    const previousStatus = task.estado;
    task.estado = 'completada';
    task.fechaFinalizacion = new Date();
    task.completedBy = currentUser.id;
    task.fechaActualizacion = new Date();

    // Si pertenece a un tablero, mover a la lista "Completada"
    if (task.boardId) {
      const completedList = await List.findOne({
        where: {
          boardId: task.boardId,
          nombre: { [Op.like]: '%completad%' }
        }
      });
      if (completedList) {
        task.listId = completedList.id;
      }
    }

    await task.save();

    if (previousStatus !== 'completada') {
      await historyService.recordHistory({
        tareaId: task.id,
        tarea: task.titulo,
        estadoAnterior: previousStatus,
        estadoNuevo: 'completada',
        usuario: currentUser.nombre,
        usuarioId: currentUser.id,
        motivo: 'Tarea completada exitosamente'
      });
    }

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'COMPLETAR TAREA',
      recurso: `PATCH /api/tasks/${id}/complete`,
      recursoId: task.id,
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: `Tarea "${task.titulo}" completada`
    });

    return await this.getTaskById(task.id);
  },

  async restoreTask(id, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    const previousStatus = task.estado;
    task.estado = 'pendiente';
    task.fechaFinalizacion = null;
    task.completedBy = null;
    task.fechaActualizacion = new Date();

    // Mover a la primera columna disponible del tablero
    if (task.boardId) {
      const firstList = await List.findOne({
        where: { boardId: task.boardId },
        order: [['posicion', 'ASC']]
      });
      if (firstList) {
        task.listId = firstList.id;
      }
    }

    await task.save();

    await historyService.recordHistory({
      tareaId: task.id,
      tarea: task.titulo,
      estadoAnterior: previousStatus,
      estadoNuevo: 'pendiente',
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      motivo: 'Tarea restaurada a pendientes'
    });

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'RESTAURAR TAREA',
      recurso: `PATCH /api/tasks/${id}/restore`,
      recursoId: task.id,
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: `Tarea restaurada: "${task.titulo}"`
    });

    return await this.getTaskById(task.id);
  },

  async archiveTask(id, isArchived = true, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    task.isArchived = isArchived;
    task.fechaActualizacion = new Date();
    await task.save();

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: isArchived ? 'ARCHIVAR TAREA' : 'DESARCHIVAR TAREA',
      recurso: `PATCH /api/tasks/${id}/archive`,
      recursoId: task.id,
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: `Tarea "${task.titulo}" ${isArchived ? 'archivada' : 'desarchivada'}`
    });

    return await this.getTaskById(task.id);
  },

  async moveTask(id, { listId, posicion }, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    const previousStatus = task.estado;
    const targetListId = parseInt(listId, 10);
    const targetList = await List.findByPk(targetListId);

    if (targetList) {
      task.listId = targetList.id;
      task.boardId = targetList.boardId;

      // Si la lista de destino es "Completada"
      if (targetList.nombre.toLowerCase().includes('completad')) {
        task.estado = 'completada';
        task.fechaFinalizacion = new Date();
        task.completedBy = currentUser.id;
      } else if (previousStatus === 'completada') {
        task.estado = 'en progreso';
        task.fechaFinalizacion = null;
        task.completedBy = null;
      }
    }

    if (posicion !== undefined) {
      task.posicion = parseInt(posicion, 10);
    }

    task.fechaActualizacion = new Date();
    await task.save();

    if (previousStatus !== task.estado) {
      await historyService.recordHistory({
        tareaId: task.id,
        tarea: task.titulo,
        estadoAnterior: previousStatus,
        estadoNuevo: task.estado,
        usuario: currentUser.nombre,
        usuarioId: currentUser.id,
        motivo: `Movida a la columna "${targetList?.nombre || 'Nueva'}"`
      });
    }

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'MOVER TAREA',
      recurso: `PATCH /api/tasks/${id}/move`,
      recursoId: task.id,
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: `Tarea "${task.titulo}" movida a lista #${targetListId}`
    });

    return await this.getTaskById(task.id);
  },

  async deleteTask(id, currentUser) {
    const numericId = Number(id);
    const task = await Task.findByPk(numericId);
    if (!task) {
      const error = new Error(`Tarea con ID ${id} no encontrada`);
      error.status = 404;
      throw error;
    }

    const deletedJson = task.toJSON();
    await task.destroy();

    await activityService.recordActivity({
      usuario: currentUser.nombre,
      usuarioId: currentUser.id,
      accion: 'ELIMINAR TAREA',
      recurso: `DELETE /api/tasks/${id}`,
      recursoId: numericId,
      metodo: 'DELETE',
      codigoHttp: 200,
      detalles: `Tarea eliminada: "${deletedJson.titulo}" (ID: ${deletedJson.id})`
    });

    return deletedJson;
  }
};

export default taskService;
