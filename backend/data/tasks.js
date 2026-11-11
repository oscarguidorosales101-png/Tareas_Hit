/**
 * Colección de Tareas en memoria
 * Contiene tareas de demostración iniciales
 */

export const tasks = [
  {
    id: 1,
    titulo: 'Diseñar arquitectura de middlewares',
    descripcion: 'Definir el pipeline secuencial de middlewares globales y específicos en Express: Logger, JSON, CORS, Auth, Validate, RateLimit y ErrorHandler.',
    prioridad: 'alta',
    estado: 'completada',
    fechaCreacion: '2026-11-01T09:00:00.000Z',
    fechaLimite: '2026-11-05',
    usuarioId: 1,
    fechaActualizacion: '2026-11-04T17:30:00.000Z'
  },
  {
    id: 2,
    titulo: 'Implementar autenticación y roles',
    descripcion: 'Desarrollar middlewares auth y authorize(rol) para verificar tokens Bearer y controlar permisos de usuarios vs administradores.',
    prioridad: 'alta',
    estado: 'en progreso',
    fechaCreacion: '2026-11-06T10:00:00.000Z',
    fechaLimite: '2026-11-12',
    usuarioId: 2,
    fechaActualizacion: '2026-11-08T11:00:00.000Z'
  },
  {
    id: 3,
    titulo: 'Validar payloads con validateTask',
    descripcion: 'Construir validaciones estrictas de campos sin librerías externas: título obligatorio, 3-100 caracteres y prioridad baja, media o alta.',
    prioridad: 'media',
    estado: 'pendiente',
    fechaCreacion: '2026-11-08T14:00:00.000Z',
    fechaLimite: '2026-11-15',
    usuarioId: 2,
    fechaActualizacion: '2026-11-08T14:00:00.000Z'
  },
  {
    id: 4,
    titulo: 'Optimizar dashboard administrativo',
    descripcion: 'Integrar métricas de tareas por estado, prioridad y gráficos visuales con diseño corporativo negro elegante.',
    prioridad: 'baja',
    estado: 'pendiente',
    fechaCreacion: '2026-11-09T08:30:00.000Z',
    fechaLimite: '2026-11-20',
    usuarioId: 3,
    fechaActualizacion: '2026-11-09T08:30:00.000Z'
  },
  {
    id: 5,
    titulo: 'Auditar registros de actividad e historial',
    descripcion: 'Verificar la trazabilidad completa de peticiones HTTP, operaciones administrativas y transiciones de estado de tareas.',
    prioridad: 'media',
    estado: 'en progreso',
    fechaCreacion: '2026-11-10T09:15:00.000Z',
    fechaLimite: '2026-11-18',
    usuarioId: 1,
    fechaActualizacion: '2026-11-10T10:00:00.000Z'
  }
];

let nextTaskId = 6;

export const getNextTaskId = () => {
  return nextTaskId++;
};

export const resetTasksData = (initialList = null) => {
  if (initialList) {
    tasks.length = 0;
    tasks.push(...initialList);
  }
};

