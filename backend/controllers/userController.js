import { userService } from '../services/userService.js';

export const userController = {
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
