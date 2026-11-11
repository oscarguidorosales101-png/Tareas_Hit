import { Task, User, Board, TaskAssignment } from '../models/index.js';
import { Op } from 'sequelize';

export const statsController = {
  async getDashboardStats(req, res, next) {
    try {
      const now = new Date();

      // Fechas de referencia
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Conteo general
      const total = await Task.count({ where: { isArchived: false } });
      const pendientes = await Task.count({ where: { estado: 'pendiente', isArchived: false } });
      const enProgreso = await Task.count({ where: { estado: 'en progreso', isArchived: false } });
      const completadas = await Task.count({ where: { estado: 'completada' } });

      // Tareas vencidas (fechaLimite pasada y no completadas)
      const todayStr = now.toISOString().split('T')[0];
      const vencidas = await Task.count({
        where: {
          estado: { [Op.ne]: 'completada' },
          fechaLimite: { [Op.lt]: todayStr },
          isArchived: false
        }
      });

      // Completadas por periodo
      const completadasHoy = await Task.count({
        where: {
          estado: 'completada',
          fechaFinalizacion: { [Op.gte]: startOfToday }
        }
      });

      const completadasSemana = await Task.count({
        where: {
          estado: 'completada',
          fechaFinalizacion: { [Op.gte]: startOfWeek }
        }
      });

      const completadasMes = await Task.count({
        where: {
          estado: 'completada',
          fechaFinalizacion: { [Op.gte]: startOfMonth }
        }
      });

      // Distribución por Prioridad
      const alta = await Task.count({ where: { prioridad: 'alta', isArchived: false } });
      const media = await Task.count({ where: { prioridad: 'media', isArchived: false } });
      const baja = await Task.count({ where: { prioridad: 'baja', isArchived: false } });

      // Tareas por Responsable
      const users = await User.findAll({ attributes: ['id', 'nombre', 'avatar'] });
      const porResponsable = [];
      for (const u of users) {
        const directCount = await Task.count({ where: { usuarioId: u.id, isArchived: false } });
        const asgCount = await TaskAssignment.count({ where: { userId: u.id } });
        porResponsable.push({
          id: u.id,
          nombre: u.nombre,
          avatar: u.avatar,
          totalTareas: Math.max(directCount, asgCount)
        });
      }

      // Tareas por Tablero
      const boards = await Board.findAll({ attributes: ['id', 'nombre', 'color'] });
      const porTablero = [];
      for (const b of boards) {
        const count = await Task.count({ where: { boardId: b.id, isArchived: false } });
        porTablero.push({
          id: b.id,
          nombre: b.nombre,
          color: b.color,
          totalTareas: count
        });
      }

      // Tiempo promedio de finalización
      const finishedTasks = await Task.findAll({
        where: {
          estado: 'completada',
          fechaFinalizacion: { [Op.ne]: null }
        },
        attributes: ['fechaCreacion', 'fechaFinalizacion']
      });

      let tiempoPromedioHoras = 0;
      if (finishedTasks.length > 0) {
        const totalDurationMs = finishedTasks.reduce((acc, t) => {
          const diff = new Date(t.fechaFinalizacion) - new Date(t.fechaCreacion);
          return acc + Math.max(0, diff);
        }, 0);
        tiempoPromedioHoras = Math.round(totalDurationMs / (finishedTasks.length * 1000 * 60 * 60));
      }

      res.status(200).json({
        total,
        pendientes,
        enProgreso,
        completadas,
        vencidas,
        completadasHoy,
        completadasSemana,
        completadasMes,
        porPrioridad: { alta, media, baja },
        porResponsable,
        porTablero,
        tiempoPromedioHoras
      });
    } catch (error) {
      next(error);
    }
  }
};

export default statsController;
