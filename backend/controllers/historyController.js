import { historyService } from '../services/historyService.js';
import { TaskHistory } from '../models/index.js';

export const historyController = {
  async getHistory(req, res, next) {
    try {
      const { search, estado, usuario, page, limit } = req.query;
      const history = await historyService.getAllHistory({ search, estado, usuario, page, limit });
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  },

  async getCompletedHistory(req, res, next) {
    try {
      const {
        search,
        responsable,
        completedBy,
        boardId,
        prioridad,
        filterDate,
        startDate,
        endDate,
        sortBy,
        order,
        page,
        limit
      } = req.query;

      const results = await historyService.getCompletedTasksHistory({
        search,
        responsable,
        completedBy,
        boardId,
        prioridad,
        filterDate,
        startDate,
        endDate,
        sortBy,
        order,
        page,
        limit
      });

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  },

  async getHistoryById(req, res, next) {
    try {
      const { id } = req.params;
      const entry = await TaskHistory.findByPk(id);
      if (!entry) {
        return res.status(404).json({ error: `Registro de historial #${id} no encontrado` });
      }
      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  }
};

export default historyController;
