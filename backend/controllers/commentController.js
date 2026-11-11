import { commentService } from '../services/commentService.js';

export const commentController = {
  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const comments = await commentService.getComments(id);
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  },

  async createComment(req, res, next) {
    try {
      const { id } = req.params;
      const comment = await commentService.addComment(id, req.body, req.user);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await commentService.deleteComment(id, req.user);
      res.status(200).json({ message: 'Comentario eliminado', deleted });
    } catch (error) {
      next(error);
    }
  }
};

export default commentController;

