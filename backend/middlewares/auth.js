/**
 * Middleware: Auth & Authorize
 * Autentica usuarios mediante tokens Bearer y autoriza según su rol.
 */

import { authService } from '../services/authService.js';

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Acceso no autorizado: Token no proporcionado',
      status: 401
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Formato de token inválido. Debe ser Bearer <token>',
      status: 401
    });
  }

  const token = parts[1];
  try {
    const user = await authService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido o expirado',
        status: 401
      });
    }

    // Guardar usuario autenticado en la petición
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de Autorización por Rol
 * @param {string|string[]} roles - Rol o lista de roles permitidos
 */
export const authorize = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        status: 401
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado: Se requiere rol [${allowedRoles.join(', ')}], pero el usuario tiene rol [${req.user.rol}]`,
        status: 403
      });
    }

    next();
  };
};

/**
 * Middleware de autenticación opcional:
 * Si hay token lo valida y puebla req.user, si no hay token continúa.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const user = await authService.verifyToken(parts[1]);
      if (user) {
        req.user = user;
        req.token = parts[1];
      }
    } catch {
      // Ignorar fallo de token opcional
    }
  }
  next();
};
