/**
 * Middleware: Error Handler y Not Found
 * Gestión centralizada de errores y respuestas 404 para rutas no existentes.
 * Soporta integración de excepciones de Sequelize y MySQL.
 */

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    status: 404
  });
};

export const errorHandler = (err, req, res, next) => {
  // Evitar respuestas duplicadas si las cabeceras ya se enviaron
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details || null;

  // Integración de errores de Sequelize / MySQL
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Error de validación en la base de datos';
    details = err.errors ? err.errors.map(e => e.message) : [err.message];
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Error de clave foránea: El registro referenciado no existe o no puede ser modificado';
  } else if (err.name === 'SequelizeAccessDeniedError' || err.name === 'SequelizeConnectionRefusedError') {
    statusCode = 500;
    message = 'Error de conexión con la base de datos MySQL. Verifica las credenciales y el estado del servicio.';
  }

  // Mostrar traza en desarrollo para depuración interna en errores 500
  if (statusCode === 500) {
    console.error('[SERVER ERROR]', err);
  }

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(details ? { details } : {})
  });
};
