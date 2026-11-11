import { checklistService } from '../services/checklistService.js';

export const checklistController = {
  async getChecklists(req, res, next) {
    try {
      const { id } = req.params;
      const lists = await checklistService.getChecklists(id);
      res.status(200).json(lists);
    } catch (error) {
      next(error);
    }
  },

  async createChecklist(req, res, next) {
    try {
      const { id } = req.params;
      const chk = await checklistService.createChecklist(id, req.body);
      res.status(201).json(chk);
    } catch (error) {
      next(error);
    }
  },

  async addItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await checklistService.addItem(id, req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await checklistService.updateItem(id, req.body);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  },

  async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await checklistService.deleteItem(id);
      res.status(200).json({ message: 'Elemento eliminado', deleted });
    } catch (error) {
      next(error);
    }
  }
};

export default checklistController;

