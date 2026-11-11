/**
 * Middleware: Logger
 * Registra fecha, hora, método HTTP, URL, código de respuesta y tiempo transcurrido.
 * Formato requerido: [2026-11-10 10:15:32] POST /api/tasks -> 201 (4 ms)
 */

export const logger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const now = new Date();

    const pad = (n) => String(n).padStart(2, '0');
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const logLine = `[${formattedDate}] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${duration} ms)`;

    // Salida por consola
    console.log(logLine);
  });

  next();
};

