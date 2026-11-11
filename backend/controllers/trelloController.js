import { trelloService } from '../services/trelloService.js';

export const trelloController = {
  getStatus(req, res) {
    res.status(200).json(trelloService.getStatus());
  },

  async getBoards(req, res, next) {
    try {
      const boards = await trelloService.getBoards();
      res.status(200).json(boards);
    } catch (error) {
      next(error);
    }
  },

  async getLists(req, res, next) {
    try {
      const { id } = req.params;
      const lists = await trelloService.getLists(id);
      res.status(200).json(lists);
    } catch (error) {
      next(error);
    }
  },

  async getCards(req, res, next) {
    try {
      const { id } = req.params;
      const cards = await trelloService.getCards(id);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  },

  async importCard(req, res, next) {
    try {
      const { cardId, localBoardId, localListId } = req.body;
      const imported = await trelloService.importCard(cardId, localBoardId, localListId, req.user);
      res.status(201).json({
        message: 'Tarjeta de Trello importada exitosamente a Tareas_Hit',
        task: imported
      });
    } catch (error) {
      next(error);
    }
  }
};

export default trelloController;

