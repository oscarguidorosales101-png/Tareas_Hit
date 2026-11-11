import { ActivityLog } from '../models/index.js';
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

export const activityService = {
  async getAllLogs({ search, httpStatus, limit = 100, page = 1 } = {}) {
    const where = {};

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { usuario: { [Op.like]: term } },
        { accion: { [Op.like]: term } },
        { recurso: { [Op.like]: term } },
        { detalles: { [Op.like]: term } }
      ];
    }

    if (httpStatus) {
      if (httpStatus === '2xx') {
        where.codigoHttp = { [Op.between]: [200, 299] };
      } else if (httpStatus === '4xx') {
        where.codigoHttp = { [Op.between]: [400, 499] };
      } else if (httpStatus === '5xx') {
        where.codigoHttp = { [Op.gte]: 500 };
      } else if (!isNaN(httpStatus)) {
        where.codigoHttp = parseInt(httpStatus, 10);
      }
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    return await ActivityLog.findAll({
      where,
      order: [['id', 'DESC']],
      limit: parseInt(limit, 10),
      offset
    });
  },

  async recordActivity({
    usuario = 'Anónimo',
    usuarioId = null,
    accion = 'OPERACIÓN',
    recurso = 'API',
    recursoId = null,
    metodo = 'GET',
    codigoHttp = 200,
    detalles = ''
  }) {
    try {
      return await ActivityLog.create({
        usuario,
        usuarioId,
        accion: accion.toUpperCase(),
        recurso,
        recursoId,
        metodo,
        codigoHttp: Number(codigoHttp),
        detalles,
        fecha: formatDate()
      });
    } catch (e) {
      console.warn('[ACTIVITY LOG WARNING] No se pudo guardar ActivityLog:', e.message);
      return null;
    }
  }
};

export default activityService;
