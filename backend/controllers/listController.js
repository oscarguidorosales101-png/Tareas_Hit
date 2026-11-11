import { listService } from '../services/listService.js';

export const listController = {
  async updateList(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await listService.updateList(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteList(req, res, next) {
    try {
      const { id } = req.params;
      const { moveTasksToListId } = req.body || {};
      const deleted = await listService.deleteList(id, { moveTasksToListId });
      res.status(200).json({ message: 'Columna eliminada correctamente', deleted });
    } catch (error) {
      next(error);
    }
  },

  async reorderList(req, res, next) {
    try {
      const { id } = req.params;
      const { orderedListIds, boardId } = req.body;
      const lists = await listService.reorderLists(boardId || id, orderedListIds);
      res.status(200).json(lists);
    } catch (error) {
      next(error);
    }
  }
};

export default listController;

