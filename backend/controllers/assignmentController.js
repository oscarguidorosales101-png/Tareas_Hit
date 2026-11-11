import { assignmentService } from '../services/assignmentService.js';

export const assignmentController = {
  async getAssignments(req, res, next) {
    try {
      const { id } = req.params;
      const assignments = await assignmentService.getAssignments(id);
      res.status(200).json(assignments);
    } catch (error) {
      next(error);
    }
  },

  async createAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await assignmentService.assignUser(id, req.body);
      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  },

  async deleteAssignment(req, res, next) {
    try {
      const { id, assignmentId } = req.params;
      const result = await assignmentService.removeAssignment(id, assignmentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

export default assignmentController;

