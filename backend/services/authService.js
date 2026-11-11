import crypto from 'node:crypto';
import { User, ActivityLog } from '../models/index.js';

// Mapa de tokens activos en memoria (token -> userId)
const activeTokens = new Map();

// Tokens estáticos de demostración académica para facilidad de pruebas
const STATIC_DEMO_TOKENS = {
  'demo-admin-token-2026': 1,
  'demo-user-token-2026': 2
};

const formatDate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const authService = {
  async login(email, password) {
    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    if (user.estado !== 'activo') {
      const error = new Error('Usuario suspendido o inactivo');
      error.status = 403;
      throw error;
    }

    // Actualizar último acceso en MySQL
    const formattedNow = formatDate();
    user.ultimoAcceso = formattedNow;
    await user.save();

    // Generar token único
    const randomHex = crypto.randomBytes(16).toString('hex');
    const token = `hit_${user.rol}_${user.id}_${randomHex}`;
    activeTokens.set(token, user.id);

    // Registrar en ActivityLog (MySQL)
    try {
      await ActivityLog.create({
        usuario: user.nombre,
        usuarioId: user.id,
        accion: 'INICIO DE SESIÓN',
        recurso: 'POST /api/auth/login',
        metodo: 'POST',
        codigoHttp: 200,
        detalles: `Inicio de sesión exitoso con rol ${user.rol}`,
        fecha: formattedNow
      });
    } catch (e) {
      console.warn('[LOG WARNING] No se pudo guardar ActivityLog:', e.message);
    }

    return {
      token,
      user: user.toJSON()
    };
  },

  async verifyToken(token) {
    if (!token) return null;

    let userId = activeTokens.get(token);
    if (!userId && STATIC_DEMO_TOKENS[token]) {
      userId = STATIC_DEMO_TOKENS[token];
    }

    if (!userId) {
      return null;
    }

    const user = await User.findByPk(userId);
    if (!user || user.estado !== 'activo') return null;

    return user.toJSON();
  },

  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.toJSON();
  },

  async logout(token, user) {
    if (token) {
      activeTokens.delete(token);
    }
    if (user) {
      try {
        await ActivityLog.create({
          usuario: user.nombre,
          usuarioId: user.id,
          accion: 'CIERRE DE SESIÓN',
          recurso: 'POST /api/auth/logout',
          metodo: 'POST',
          codigoHttp: 200,
          detalles: 'Cierre de sesión local',
          fecha: formatDate()
        });
      } catch (e) {
        // Ignorar error al registrar logout
      }
    }
  }
};

export default authService;
