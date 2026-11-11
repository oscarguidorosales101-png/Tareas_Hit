import { labelService } from '../services/labelService.js';

export const labelController = {
  async getLabels(req, res, next) {
    try {
      const labels = await labelService.getAllLabels();
      res.status(200).json(labels);
    } catch (error) {
      next(error);
    }
  },

  async createLabel(req, res, next) {
    try {
      const label = await labelService.createLabel(req.body);
      res.status(201).json(label);
    } catch (error) {
      next(error);
    }
  },

  async attachLabel(req, res, next) {
    try {
      const { id, labelId } = req.params;
      const labels = await labelService.attachLabel(id, labelId);
      res.status(200).json(labels);
    } catch (error) {
      next(error);
    }
  },

  async detachLabel(req, res, next) {
    try {
      const { id, labelId } = req.params;
      const labels = await labelService.detachLabel(id, labelId);
      res.status(200).json(labels);
    } catch (error) {
      next(error);
    }
  }
};

export default labelController;

