/**
 * Colección de Registros de Actividad en memoria
 * Guarda bitácora de operaciones y peticiones HTTP relevantes
 */

export const activityLogs = [
  {
    id: 1,
    usuario: 'Administrador Hit',
    usuarioId: 1,
    accion: 'INICIO DE SESIÓN',
    recurso: 'POST /api/auth/login',
    fecha: '2026-11-10 08:30:12',
    codigoHttp: 200,
    detalles: 'Autenticación exitosa como admin'
  },
  {
    id: 2,
    usuario: 'Carlos Desarrollador',
    usuarioId: 2,
    accion: 'CREAR TAREA',
    recurso: 'POST /api/tasks',
    fecha: '2026-11-10 09:15:45',
    codigoHttp: 201,
    detalles: 'Tarea: Validar payloads con validateTask'
  },
  {
    id: 3,
    usuario: 'Ana Diseñadora',
    usuarioId: 3,
    accion: 'CONSULTAR TAREAS',
    recurso: 'GET /api/tasks',
    fecha: '2026-11-10 10:00:22',
    codigoHttp: 200,
    detalles: 'Consulta de listado de tareas con filtros'
  },
  {
    id: 4,
    usuario: 'Administrador Hit',
    usuarioId: 1,
    accion: 'COMPLETAR TAREA',
    recurso: 'PATCH /api/tasks/1/complete',
    fecha: '2026-11-10 10:45:10',
    codigoHttp: 200,
    detalles: 'Tarea 1 marcada como completada'
  }
];

let nextLogId = 5;

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

export const recordActivity = ({
  usuario = 'Anónimo',
  usuarioId = null,
  accion = 'OPERACIÓN',
  recurso = 'API',
  codigoHttp = 200,
  detalles = ''
}) => {
  const newLog = {
    id: nextLogId++,
    usuario,
    usuarioId,
    accion: accion.toUpperCase(),
    recurso,
    fecha: formatDate(),
    codigoHttp: Number(codigoHttp),
    detalles
  };
  activityLogs.unshift(newLog); // Más recientes primero
  return newLog;
};

