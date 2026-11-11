import { authService } from '../services/authService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const result = await authService.login(email, password);
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  },

  getMe(req, res, next) {
    try {
      res.status(200).json({
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.token, req.user);
      res.status(200).json({
        message: 'Sesión finalizada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
};
