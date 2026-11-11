import { activityService } from '../services/activityService.js';

export const activityController = {
  async getLogs(req, res, next) {
    try {
      const { search, httpStatus, limit, page } = req.query;
      const logs = await activityService.getAllLogs({ search, httpStatus, limit, page });
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
};

export default activityController;
