/**
 * Middleware: ValidateTask
 * Validación estricta manual sin dependencias externas (sin Joi, Zod ni express-validator).
 */

const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta'];
const ESTADOS_VALIDOS = ['pendiente', 'en progreso', 'completada'];

export const validateTask = (req, res, next) => {
  const errors = [];
  const { titulo, descripcion, prioridad, estado, fechaLimite } = req.body || {};

  // 1. Validación de Título (Obligatorio en creación)
  if (titulo === undefined || titulo === null || titulo === '') {
    errors.push('El título es obligatorio.');
  } else if (typeof titulo !== 'string') {
    errors.push('El título debe ser una cadena de texto.');
  } else {
    const trimmed = titulo.trim();
    if (trimmed.length < 3) {
      errors.push('El título debe contener al menos 3 caracteres.');
    }
    if (trimmed.length > 100) {
      errors.push('El título no debe exceder los 100 caracteres.');
    }
  }

  // 2. Validación de Prioridad
  if (prioridad !== undefined && prioridad !== null) {
    if (typeof prioridad !== 'string' || !PRIORIDADES_VALIDAS.includes(prioridad.toLowerCase())) {
      errors.push(`La prioridad debe ser una de las siguientes: ${PRIORIDADES_VALIDAS.join(', ')}.`);
    }
  }

  // 3. Validación de Estado (si se proporciona)
  if (estado !== undefined && estado !== null) {
    if (typeof estado !== 'string' || !ESTADOS_VALIDOS.includes(estado.toLowerCase())) {
      errors.push(`El estado debe ser uno de los siguientes: ${ESTADOS_VALIDOS.join(', ')}.`);
    }
  }

  // 4. Validación de Descripción (opcional, pero si existe debe ser texto)
  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    errors.push('La descripción debe ser una cadena de texto.');
  }

  // Si hay errores acumulados, devolver 400 con todos los detalles
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación en los datos de la tarea',
      details: errors,
      status: 400
    });
  }

  next();
};

/**
 * Middleware opcional para validar campos al actualizar (PATCH)
 */
export const validateTaskUpdate = (req, res, next) => {
  const errors = [];
  const { titulo, descripcion, prioridad, estado } = req.body || {};

  if (titulo !== undefined) {
    if (typeof titulo !== 'string') {
      errors.push('El título debe ser una cadena de texto.');
    } else {
      const trimmed = titulo.trim();
      if (trimmed.length < 3) {
        errors.push('El título debe contener al menos 3 caracteres.');
      }
      if (trimmed.length > 100) {
        errors.push('El título no debe exceder los 100 caracteres.');
      }
    }
  }

  if (prioridad !== undefined) {
    if (typeof prioridad !== 'string' || !PRIORIDADES_VALIDAS.includes(prioridad.toLowerCase())) {
      errors.push(`La prioridad debe ser una de las siguientes: ${PRIORIDADES_VALIDAS.join(', ')}.`);
    }
  }

  if (estado !== undefined) {
    if (typeof estado !== 'string' || !ESTADOS_VALIDOS.includes(estado.toLowerCase())) {
      errors.push(`El estado debe ser uno de los siguientes: ${ESTADOS_VALIDOS.join(', ')}.`);
    }
  }

  if (descripcion !== undefined && typeof descripcion !== 'string') {
    errors.push('La descripción debe ser una cadena de texto.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación al actualizar la tarea',
      details: errors,
      status: 400
    });
  }

  next();
};

