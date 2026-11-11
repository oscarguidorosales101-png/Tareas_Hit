import bcrypt from 'bcryptjs';
import {
  sequelize,
  User,
  Board,
  BoardMember,
  List,
  Task,
  TaskAssignment,
  Label,
  TaskLabel,
  Comment,
  Checklist,
  ChecklistItem,
  ActivityLog,
  TaskHistory
} from '../models/index.js';

export const seedDatabase = async () => {
  console.log('[SEEDER] Iniciando carga de datos iniciales en MySQL...');

  // 1. Usuarios demo obligatorios
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedUserPass = await bcrypt.hash('user123', 10);

  const [adminUser] = await User.findOrCreate({
    where: { email: 'admin@hit.com' },
    defaults: {
      nombre: 'Administrador Hit',
      email: 'admin@hit.com',
      password: hashedAdminPass,
      rol: 'admin',
      estado: 'activo',
      ultimoAcceso: '2026-11-10 14:15:00',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    }
  });

  const [carlosUser] = await User.findOrCreate({
    where: { email: 'usuario@hit.com' },
    defaults: {
      nombre: 'Carlos Desarrollador',
      email: 'usuario@hit.com',
      password: hashedUserPass,
      rol: 'user',
      estado: 'activo',
      ultimoAcceso: '2026-11-10 13:45:00',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    }
  });

  const [anaUser] = await User.findOrCreate({
    where: { email: 'ana@hit.com' },
    defaults: {
      nombre: 'Ana Diseñadora',
      email: 'ana@hit.com',
      password: hashedUserPass,
      rol: 'user',
      estado: 'activo',
      ultimoAcceso: '2026-11-09 18:20:00',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    }
  });

  const [luciaUser] = await User.findOrCreate({
    where: { email: 'lucia@hit.com' },
    defaults: {
      nombre: 'Lucía Tester QA',
      email: 'lucia@hit.com',
      password: hashedUserPass,
      rol: 'user',
      estado: 'activo',
      ultimoAcceso: '2026-11-08 16:10:00',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
    }
  });

  // 2. Tablero Principal
  const [board] = await Board.findOrCreate({
    where: { nombre: 'Tablero Principal de Desarrollo' },
    defaults: {
      nombre: 'Tablero Principal de Desarrollo',
      descripcion: 'Espacio de trabajo colaborativo Kanban para el sprint de Middlewares y Tareas_Hit',
      color: '#3b82f6',
      ownerId: adminUser.id
    }
  });

  // 3. Miembros del Tablero
  const usersList = [adminUser, carlosUser, anaUser, luciaUser];
  for (const u of usersList) {
    await BoardMember.findOrCreate({
      where: { boardId: board.id, userId: u.id },
      defaults: {
        boardId: board.id,
        userId: u.id,
        rol: u.id === adminUser.id ? 'owner' : 'member'
      }
    });
  }

  // 4. Columnas Kanban (Listas)
  const columnsData = [
    { nombre: 'Por hacer', posicion: 0, color: '#94a3b8' },
    { nombre: 'En progreso', posicion: 1, color: '#f59e0b' },
    { nombre: 'En revisión', posicion: 2, color: '#8b5cf6' },
    { nombre: 'Completada', posicion: 3, color: '#10b981' }
  ];

  const createdLists = [];
  for (const col of columnsData) {
    const [list] = await List.findOrCreate({
      where: { boardId: board.id, nombre: col.nombre },
      defaults: {
        boardId: board.id,
        nombre: col.nombre,
        posicion: col.posicion,
        color: col.color
      }
    });
    createdLists.push(list);
  }

  // 5. Etiquetas de colores (Labels)
  const labelsData = [
    { nombre: 'Backend', color: '#10b981', descripcion: 'Lógica de servidor, API y middlewares' },
    { nombre: 'Frontend', color: '#3b82f6', descripcion: 'Componentes e interfaces en React' },
    { nombre: 'Urgente', color: '#ef4444', descripcion: 'Prioridad máxima requerida' },
    { nombre: 'Diseño', color: '#f59e0b', descripcion: 'Estilo y experiencia de usuario' },
    { nombre: 'Investigación', color: '#8b5cf6', descripcion: 'Evaluación técnica y arquitectura' },
    { nombre: 'Documentación', color: '#06b6d4', descripcion: 'Manuales, READMEs y guías' }
  ];

  const createdLabels = {};
  for (const l of labelsData) {
    const [label] = await Label.findOrCreate({
      where: { nombre: l.nombre },
      defaults: l
    });
    createdLabels[l.nombre] = label;
  }

  // 6. Tareas iniciales (Conserva datos originales de tareas 1 a 5)
  const tasksData = [
    {
      id: 1,
      titulo: 'Diseñar arquitectura de middlewares',
      descripcion: 'Definir el pipeline secuencial de middlewares globales y específicos en Express: Logger, JSON, CORS, Auth, Validate, RateLimit y ErrorHandler.',
      prioridad: 'alta',
      estado: 'completada',
      color: '#10b981',
      listId: createdLists[3].id, // Completada
      boardId: board.id,
      usuarioId: adminUser.id,
      completedBy: adminUser.id,
      fechaCreacion: new Date('2026-11-01T09:00:00.000Z'),
      fechaActualizacion: new Date('2026-11-04T17:30:00.000Z'),
      fechaFinalizacion: new Date('2026-11-04T17:30:00.000Z'),
      fechaLimite: '2026-11-05',
      posicion: 0
    },
    {
      id: 2,
      titulo: 'Implementar autenticación y roles',
      descripcion: 'Desarrollar middlewares auth y authorize(rol) para verificar tokens Bearer y controlar permisos de usuarios vs administradores.',
      prioridad: 'alta',
      estado: 'en progreso',
      color: '#ef4444',
      listId: createdLists[1].id, // En progreso
      boardId: board.id,
      usuarioId: carlosUser.id,
      fechaCreacion: new Date('2026-11-06T10:00:00.000Z'),
      fechaActualizacion: new Date('2026-11-08T11:00:00.000Z'),
      fechaLimite: '2026-11-12',
      posicion: 0
    },
    {
      id: 3,
      titulo: 'Validar payloads con validateTask',
      descripcion: 'Construir validaciones estrictas de campos sin librerías externas: título obligatorio, 3-100 caracteres y prioridad baja, media o alta.',
      prioridad: 'media',
      estado: 'pendiente',
      color: '#f59e0b',
      listId: createdLists[0].id, // Por hacer
      boardId: board.id,
      usuarioId: carlosUser.id,
      fechaCreacion: new Date('2026-11-08T14:00:00.000Z'),
      fechaActualizacion: new Date('2026-11-08T14:00:00.000Z'),
      fechaLimite: '2026-11-15',
      posicion: 0
    },
    {
      id: 4,
      titulo: 'Optimizar dashboard administrativo',
      descripcion: 'Integrar métricas de tareas por estado, prioridad y gráficos visuales con diseño corporativo negro elegante.',
      prioridad: 'baja',
      estado: 'pendiente',
      color: '#3b82f6',
      listId: createdLists[0].id, // Por hacer
      boardId: board.id,
      usuarioId: anaUser.id,
      fechaCreacion: new Date('2026-11-09T08:30:00.000Z'),
      fechaActualizacion: new Date('2026-11-09T08:30:00.000Z'),
      fechaLimite: '2026-11-20',
      posicion: 1
    },
    {
      id: 5,
      titulo: 'Auditar registros de actividad e historial',
      descripcion: 'Verificar la trazabilidad completa de peticiones HTTP, operaciones administrativas y transiciones de estado de tareas.',
      prioridad: 'media',
      estado: 'en progreso',
      color: '#8b5cf6',
      listId: createdLists[1].id, // En progreso
      boardId: board.id,
      usuarioId: adminUser.id,
      fechaCreacion: new Date('2026-11-10T09:15:00.000Z'),
      fechaActualizacion: new Date('2026-11-10T10:00:00.000Z'),
      fechaLimite: '2026-11-18',
      posicion: 1
    }
  ];

  for (const t of tasksData) {
    const [task] = await Task.findOrCreate({
      where: { id: t.id },
      defaults: t
    });

    // Asignar responsable principal
    await TaskAssignment.findOrCreate({
      where: { taskId: task.id, userId: t.usuarioId, tipo: 'responsable' },
      defaults: { taskId: task.id, userId: t.usuarioId, tipo: 'responsable' }
    });

    // Asignar colaborador en la tarea 2
    if (t.id === 2) {
      await TaskAssignment.findOrCreate({
        where: { taskId: task.id, userId: adminUser.id, tipo: 'colaborador' },
        defaults: { taskId: task.id, userId: adminUser.id, tipo: 'colaborador' }
      });
      // Etiqueta Backend y Urgente
      await task.addLabels([createdLabels['Backend'], createdLabels['Urgente']]);
    }

    if (t.id === 1) {
      await task.addLabels([createdLabels['Backend'], createdLabels['Documentación']]);
    }
    if (t.id === 4) {
      await task.addLabels([createdLabels['Frontend'], createdLabels['Diseño']]);
    }

    // Agregar Checklist de demostración en tarea 2
    if (t.id === 2) {
      const [chk] = await Checklist.findOrCreate({
        where: { taskId: task.id },
        defaults: { taskId: task.id, titulo: 'Fases de Implementación' }
      });

      await ChecklistItem.findOrCreate({
        where: { checklistId: chk.id, contenido: 'Crear middleware auth.js con extracción Bearer' },
        defaults: { checklistId: chk.id, contenido: 'Crear middleware auth.js con extracción Bearer', completado: true, posicion: 0 }
      });
      await ChecklistItem.findOrCreate({
        where: { checklistId: chk.id, contenido: 'Implementar authorize(rol) para control 403' },
        defaults: { checklistId: chk.id, contenido: 'Implementar authorize(rol) para control 403', completado: true, posicion: 1 }
      });
      await ChecklistItem.findOrCreate({
        where: { checklistId: chk.id, contenido: 'Escribir pruebas unitarias de permisos' },
        defaults: { checklistId: chk.id, contenido: 'Escribir pruebas unitarias de permisos', completado: false, posicion: 2 }
      });
    }

    // Agregar Comentarios de demostración
    if (t.id === 2) {
      await Comment.findOrCreate({
        where: { taskId: task.id, userId: adminUser.id },
        defaults: {
          taskId: task.id,
          userId: adminUser.id,
          contenido: 'Revisar que el token devuelva 401 si viene mal formateado o ausente.'
        }
      });
    }
  }

  // 7. Bitácora de Actividad inicial (ActivityLog)
  const initialLogs = [
    {
      usuario: 'Administrador Hit',
      usuarioId: 1,
      accion: 'INICIO DE SESIÓN',
      recurso: 'POST /api/auth/login',
      metodo: 'POST',
      codigoHttp: 200,
      detalles: 'Autenticación exitosa como admin',
      fecha: '2026-11-10 08:30:12'
    },
    {
      usuario: 'Carlos Desarrollador',
      usuarioId: 2,
      accion: 'CREAR TAREA',
      recurso: 'POST /api/tasks',
      metodo: 'POST',
      codigoHttp: 201,
      detalles: 'Tarea: Validar payloads con validateTask',
      fecha: '2026-11-10 09:15:45'
    },
    {
      usuario: 'Ana Diseñadora',
      usuarioId: 3,
      accion: 'CONSULTAR TAREAS',
      recurso: 'GET /api/tasks',
      metodo: 'GET',
      codigoHttp: 200,
      detalles: 'Consulta de listado de tareas con filtros',
      fecha: '2026-11-10 10:00:22'
    },
    {
      usuario: 'Administrador Hit',
      usuarioId: 1,
      accion: 'COMPLETAR TAREA',
      recurso: 'PATCH /api/tasks/1/complete',
      metodo: 'PATCH',
      codigoHttp: 200,
      detalles: 'Tarea 1 marcada como completada',
      fecha: '2026-11-10 10:45:10'
    }
  ];

  for (const log of initialLogs) {
    await ActivityLog.findOrCreate({
      where: { recurso: log.recurso, fecha: log.fecha },
      defaults: log
    });
  }

  // 8. Historial de Tareas inicial (TaskHistory)
  const initialHistory = [
    {
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

  for (const h of initialHistory) {
    await TaskHistory.findOrCreate({
      where: { tareaId: h.tareaId, fecha: h.fecha, estadoNuevo: h.estadoNuevo },
      defaults: h
    });
  }

  console.log('[SEEDER] Carga inicial completada exitosamente en MySQL.');
};

export default seedDatabase;

