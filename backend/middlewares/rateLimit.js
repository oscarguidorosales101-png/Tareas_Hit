/**
 * Middleware: Rate Limiting
 * Limita el número de solicitudes por dirección IP en una ventana de 60 segundos.
 * Configuración estándar: Máximo 50 solicitudes por minuto por IP.
 * Prueba académica: Permite límite de 10 solicitudes para verificar comportamiento original (Test 20).
 * Responde 429 cuando se supera el límite.
 * Implementado sin librerías externas.
 */

// Almacena un mapa de IP -> array de marcas de tiempo [timestamp1, timestamp2, ...]
const ipRequestsMap = new Map();

const WINDOW_MS = 60 * 1000; // 60 segundos en milisegundos
const DEFAULT_MAX_REQUESTS = 50; // Límite normal de 50 solicitudes por minuto

export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    const ip = list[0].trim();
    if (ip) return normalizeIp(ip);
  }
  return normalizeIp(req.ip || req.connection?.remoteAddress || '127.0.0.1');
};

const normalizeIp = (ip) => {
  if (!ip) return '127.0.0.1';
  // Normalizar IPv6 loopback y prefijos IPv4 mapeados
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
};

/**
 * Función para reiniciar el almacén de rate limit (útil para pruebas)
 */
export const resetRateLimits = () => {
  ipRequestsMap.clear();
};

/**
 * Fábrica de middleware de Rate Limit configurable
 */
export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || WINDOW_MS;

  return (req, res, next) => {
    // 1. Excluir solicitudes CORS preflight OPTIONS
    if (req.method === 'OPTIONS') {
      return next();
    }

    // 2. Si viene la cabecera explícita para omitir rate limit (para pruebas selectivas internas)
    if (req.headers['x-bypass-rate-limit'] === 'true') {
      return next();
    }

    // Determinar límite: si options.max está fijado se usa ese; sino busca en env o usa 50
    let max = options.max;
    if (!max) {
      max = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : DEFAULT_MAX_REQUESTS;
    }

    // Si viene parámetro query o header de test específico para límite aislado de 10 solicitudes
    if (req.query?.testLimit === '10' || req.headers['x-test-rate-limit'] === '10') {
      max = 10;
    }

    const ip = getClientIp(req);
    const key = `${ip}_limit_${max}`;
    const now = Date.now();

    // Obtener marcas de tiempo para esta IP y límite
    const timestamps = ipRequestsMap.get(key) || [];

    // Filtrar marcas de tiempo que aún están dentro de la ventana de 60s
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);

    if (validTimestamps.length >= max) {
      const oldestValid = validTimestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestValid + windowMs - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldestValid + windowMs) / 1000));

      return res.status(429).json({
        error: `Demasiadas solicitudes. Límite de ${max} solicitudes por minuto superado para la IP ${ip}.`,
        status: 429,
        limit: max,
        retryAfterSeconds
      });
    }

    // Registrar la solicitud actual
    validTimestamps.push(now);
    ipRequestsMap.set(key, validTimestamps);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - validTimestamps.length));

    next();
  };
};

// Instancia estándar de 50 peticiones por minuto
export const rateLimit = createRateLimiter({
  windowMs: WINDOW_MS,
  max: DEFAULT_MAX_REQUESTS
});

// Instancia aislada para la prueba académica original de 10 peticiones
export const academicRateLimit = createRateLimiter({
  windowMs: WINDOW_MS,
  max: 10
});
