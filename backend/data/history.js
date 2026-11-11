/**
 * Colección de Historial de Tareas en memoria
 * Guarda bitácora de transiciones de estado de tareas
 */

export const taskHistory = [
  {
    id: 1,
    tareaId: 1,
    tarea: 'Diseñar arquitectura de middlewares',
    estadoAnterior: 'pendiente',
    estadoNuevo: 'en progreso',
    usuario: 'Administrador Hit',
    usuarioId: 1,
    fecha: '2026-11-02 11:00:00',
    motivo: 'Inicio del diseño y revisión técnica'
  },
  {
    id: 2,
    tareaId: 1,
    tarea: 'Diseñar arquitectura de middlewares',
    estadoAnterior: 'en progreso',
    estadoNuevo: 'completada',
    usuario: 'Administrador Hit',
    usuarioId: 1,
    fecha: '2026-11-04 17:30:00',
    motivo: 'Aprobación de la arquitectura global de Express'
  },
  {
    id: 3,
    tareaId: 2,
    tarea: 'Implementar autenticación y roles',
    estadoAnterior: 'pendiente',
    estadoNuevo: 'en progreso',
    usuario: 'Carlos Desarrollador',
    usuarioId: 2,
    fecha: '2026-11-08 11:00:00',
    motivo: 'Comienzo de desarrollo de tokens y middleware auth'
  }
];

let nextHistoryId = 4;

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

export const recordHistory = ({
  tareaId,
  tarea,
  estadoAnterior = 'pendiente',
  estadoNuevo = 'en progreso',
  usuario = 'Sistema',
  usuarioId = null,
  motivo = 'Actualización de estado'
}) => {
  const entry = {
    id: nextHistoryId++,
    tareaId: Number(tareaId),
    tarea,
    estadoAnterior,
    estadoNuevo,
    usuario,
    usuarioId,
    fecha: formatDate(),
    motivo
  };
  taskHistory.unshift(entry); // Más recientes primero
  return entry;
};

