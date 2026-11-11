import { boardService } from '../services/boardService.js';
import { listService } from '../services/listService.js';

export const boardController = {
  async getBoards(req, res, next) {
    try {
      const boards = await boardService.getBoards(req.user);
      res.status(200).json(boards);
    } catch (error) {
      next(error);
    }
  },

  async getBoardById(req, res, next) {
    try {
      const { id } = req.params;
      const board = await boardService.getBoardById(id, req.user);
      res.status(200).json(board);
    } catch (error) {
      next(error);
    }
  },

  async createBoard(req, res, next) {
    try {
      const board = await boardService.createBoard(req.body, req.user);
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  },

  async updateBoard(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await boardService.updateBoard(id, req.body, req.user);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteBoard(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await boardService.deleteBoard(id, req.user);
      res.status(200).json({ message: 'Tablero eliminado exitosamente', deleted });
    } catch (error) {
      next(error);
    }
  },

  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const member = await boardService.addMember(id, req.body);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req, res, next) {
    try {
      const { id, userId } = req.params;
      const result = await boardService.removeMember(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getLists(req, res, next) {
    try {
      const { id } = req.params;
      const lists = await listService.getListsByBoard(id);
      res.status(200).json(lists);
    } catch (error) {
      next(error);
    }
  },

  async createList(req, res, next) {
    try {
      const { id } = req.params;
      const list = await listService.createList(id, req.body);
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  }
};

export default boardController;

