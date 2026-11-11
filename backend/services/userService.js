import { User } from '../models/index.js';

export const userService = {
  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
  },

  async getUserById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }
};

export default userService;
