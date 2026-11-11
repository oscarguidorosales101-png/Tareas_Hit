import { TaskHistory, Task, User, Board, TaskAssignment } from '../models/index.js';
import { Op } from 'sequelize';

const formatDate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const historyService = {
  async getAllHistory({ search, estado, usuario, page = 1, limit = 50 } = {}) {
    const where = {};

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { tarea: { [Op.like]: term } },
        { usuario: { [Op.like]: term } },
        { motivo: { [Op.like]: term } }
      ];
    }

    if (estado && estado !== 'todos') {
      where.estadoNuevo = estado;
    }

    if (usuario) {
      where.usuario = { [Op.like]: `%${usuario}%` };
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    return await TaskHistory.findAll({
      where,
      order: [['id', 'DESC']],
      limit: parseInt(limit, 10),
      offset
    });
  },

  async getCompletedTasksHistory({
    search,
    responsable,
    completedBy,
    boardId,
    prioridad,
    filterDate, // 'hoy', 'semana', 'mes', 'anio'
    startDate,
    endDate,
    sortBy = 'fechaFinalizacion',
    order = 'DESC',
    page = 1,
    limit = 20
  } = {}) {
    const where = {
      estado: 'completada'
    };

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { titulo: { [Op.like]: term } },
        { descripcion: { [Op.like]: term } }
      ];
    }

    if (prioridad && prioridad !== 'todas') {
      where.prioridad = prioridad;
    }

    if (boardId) {
      where.boardId = parseInt(boardId, 10);
    }

    // Filtros por fecha
    const now = new Date();
    if (filterDate === 'hoy') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.fechaFinalizacion = { [Op.gte]: startOfToday };
    } else if (filterDate === 'semana') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      where.fechaFinalizacion = { [Op.gte]: startOfWeek };
    } else if (filterDate === 'mes') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.fechaFinalizacion = { [Op.gte]: startOfMonth };
    } else if (startDate || endDate) {
      const dateRange = {};
      if (startDate) dateRange[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateRange[Op.lte] = end;
      }
      where.fechaFinalizacion = dateRange;
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    // Permitir ordenar por columnas específicas
    const validSortFields = ['fechaFinalizacion', 'fechaCreacion', 'prioridad', 'titulo', 'id'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'fechaFinalizacion';
    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: User, as: 'completer', attributes: ['id', 'nombre', 'email', 'avatar'] },
        { model: Board, as: 'board', attributes: ['id', 'nombre', 'color'] },
        {
          model: TaskAssignment,
          as: 'assignments',
          include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'email', 'avatar'] }]
        }
      ],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit, 10),
      offset
    });

    // Formatear resultados calculando el tiempo transcurrido
    const items = rows.map((task) => {
      const created = new Date(task.fechaCreacion);
      const finished = task.fechaFinalizacion ? new Date(task.fechaFinalizacion) : new Date(task.fechaActualizacion);
      const diffMs = Math.max(0, finished - created);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      let tiempoEmpleado = `${hours} horas`;
      if (days > 0) {
        tiempoEmpleado = `${days} días (${hours}h)`;
      }

      // Encontrar responsable principal
      const mainAssignee = task.assignments?.find(a => a.tipo === 'responsable')?.user || task.creator;
      const colaboradores = task.assignments?.filter(a => a.tipo === 'colaborador').map(a => a.user) || [];

      return {
        id: task.id,
        titulo: task.titulo,
        descripcion: task.descripcion,
        prioridad: task.prioridad,
        estado: task.estado,
        color: task.color,
        fechaCreacion: task.fechaCreacion,
        fechaLimite: task.fechaLimite,
        fechaFinalizacion: task.fechaFinalizacion || task.fechaActualizacion,
        tiempoEmpleado,
        board: task.board,
        responsable: mainAssignee ? mainAssignee.nombre : 'Sin asignar',
        responsableAvatar: mainAssignee?.avatar,
        colaboradores,
        usuarioCreador: task.creator ? task.creator.nombre : 'Sistema',
        completadoPor: task.completer ? task.completer.nombre : (mainAssignee ? mainAssignee.nombre : 'Sistema')
      };
    });

    return {
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      limit: parseInt(limit, 10),
      items
    };
  },

  async recordHistory({
    tareaId,
    tarea,
    estadoAnterior = 'pendiente',
    estadoNuevo = 'en progreso',
    usuario = 'Sistema',
    usuarioId = null,
    motivo = 'Actualización de estado',
    datosCambio = null
  }) {
    try {
      return await TaskHistory.create({
        tareaId: Number(tareaId),
        tarea,
        estadoAnterior,
        estadoNuevo,
        usuario,
        usuarioId,
        fecha: formatDate(),
        motivo,
        datosCambio
      });
    } catch (e) {
      console.warn('[TASK HISTORY WARNING] No se pudo guardar TaskHistory:', e.message);
      return null;
    }
  }
};

export default historyService;
