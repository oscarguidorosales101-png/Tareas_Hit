import { taskService } from '../services/taskService.js';

export const taskController = {
  async getTasks(req, res, next) {
    try {
      const { search, estado, prioridad, boardId, listId, isArchived } = req.query;
      const tasks = await taskService.getAllTasks({ search, estado, prioridad, boardId, listId, isArchived });
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  async createTask(req, res, next) {
    try {
      const taskData = req.body;
      const newTask = await taskService.createTask(taskData, req.user);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await taskService.updateTask(id, updates, req.user);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async completeTask(req, res, next) {
    try {
      const { id } = req.params;
      const completed = await taskService.completeTask(id, req.user);
      res.status(200).json(completed);
    } catch (error) {
      next(error);
    }
  },

  async restoreTask(req, res, next) {
    try {
      const { id } = req.params;
      const restored = await taskService.restoreTask(id, req.user);
      res.status(200).json(restored);
    } catch (error) {
      next(error);
    }
  },

  async archiveTask(req, res, next) {
    try {
      const { id } = req.params;
      const { isArchived } = req.body;
      const archived = await taskService.archiveTask(id, isArchived, req.user);
      res.status(200).json(archived);
    } catch (error) {
      next(error);
    }
  },

  async moveTask(req, res, next) {
    try {
      const { id } = req.params;
      const { listId, posicion } = req.body;
      const moved = await taskService.moveTask(id, { listId, posicion }, req.user);
      res.status(200).json(moved);
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await taskService.deleteTask(id, req.user);
      res.status(200).json({
        message: 'Tarea eliminada correctamente',
        deleted
      });
    } catch (error) {
      next(error);
    }
  }
};

export default taskController;
