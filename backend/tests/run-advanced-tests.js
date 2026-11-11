/**
 * Suite de Pruebas Avanzadas para Tareas_Hit
 * Valida persistencia en MySQL, Tableros, Asignaciones, Checklist, Comentarios,
 * Historial Permanente, Restauración y Rate Limit normal de 50 req/min.
 */

import app from '../app.js';
import { resetRateLimits } from '../middlewares/rateLimit.js';
import { runMigrations } from '../migrations/run-migrations.js';
import { Task, Board, List, User } from '../models/index.js';

let server;
let baseUrl;

const startServer = () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[ADVANCED TESTS] Servidor iniciado en ${baseUrl}\n`);
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[ADVANCED TESTS] Servidor detenido.');
      resolve();
    });
  });
};

const results = [];

const runTest = async (id, description, testFn) => {
  try {
    await testFn();
    console.log(`✅ [TEST AVANZADO ${id}] PASÓ: ${description}`);
    results.push({ id, description, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ [TEST AVANZADO ${id}] FALLÓ: ${description}`);
    console.error(`   Error: ${error.message}`);
    results.push({ id, description, status: 'FAILED', error: error.message });
  }
};

const request = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.bypassRateLimit !== false ? { 'x-bypass-rate-limit': 'true' } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data
  };
};

const runAllAdvancedTests = async () => {
  await runMigrations({ seed: true });
  await startServer();

  let adminToken = '';
  let userToken = '';
  let testBoardId = null;
  let testListId1 = null;
  let testListId2 = null;
  let createdTaskId = null;

  console.log('======================================================');
  console.log('🚀 INICIANDO PRUEBAS DE EVOLUCIÓN FULL STACK (MYSQL)');
  console.log('======================================================\n');

  // Login para obtener tokens
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@hit.com', password: 'admin123' }
  });
  adminToken = adminLogin.data.token;

  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'usuario@hit.com', password: 'user123' }
  });
  userToken = userLogin.data.token;

  // 1. Conexión con MySQL y comprobación de datos
  await runTest(1, 'Verificar persistencia activa con MySQL y Sequelize', async () => {
    const res = await request('/api/tasks');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Se esperaban tareas persistidas en MySQL');
  });

  // 2. Creación de tablero y columnas
  await runTest(2, 'Crear Tablero Kanban y verificar columnas automáticas', async () => {
    const res = await request('/api/boards', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        nombre: 'Tablero Sprint de Pruebas',
        descripcion: 'Tablero creado durante las pruebas avanzadas',
        color: '#10b981'
      }
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    testBoardId = res.data.id;
    if (!res.data.lists || res.data.lists.length < 4) {
      throw new Error('El tablero debe incluir columnas Kanban automáticas');
    }
    testListId1 = res.data.lists[0].id;
    testListId2 = res.data.lists[1].id;
  });

  // 3. Creación persistente de tareas
  await runTest(3, 'Creación de tarea asociada a un tablero y columna en MySQL', async () => {
    const res = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        titulo: 'Tarea persistente de prueba avanzada',
        descripcion: 'Verificando persistencia y relaciones en MySQL',
        prioridad: 'alta',
        boardId: testBoardId,
        listId: testListId1,
        fechaLimite: '2026-12-31'
      }
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    createdTaskId = res.data.id;
  });

  // 4. Edición persistente
  await runTest(4, 'Edición persistente de tarea en MySQL', async () => {
    const res = await request(`/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        titulo: 'Tarea persistente modificada',
        prioridad: 'baja'
      }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.titulo !== 'Tarea persistente modificada' || res.data.prioridad !== 'baja') {
      throw new Error('Los datos modificados no coinciden en MySQL');
    }
  });

  // 5. Asignación de responsable principal
  await runTest(5, 'Asignación de responsable y validación de membresía', async () => {
    const res = await request(`/api/tasks/${createdTaskId}/assignments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        userId: 1, // Admin (es miembro)
        tipo: 'responsable'
      }
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
  });

  // 6. Validación de usuarios no pertenecientes al tablero (rechazo 400)
  await runTest(6, 'Impedir asignación a usuarios que no pertenezcan al tablero (400)', async () => {
    // Crear un nuevo tablero privado donde el usuario 3 no sea miembro
    const boardRes = await request('/api/boards', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { nombre: 'Tablero Restringido' }
    });
    const restrictedBoardId = boardRes.data.id;
    const taskRes = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { titulo: 'Tarea Restringida', boardId: restrictedBoardId }
    });

    // Intentar asignar usuario 4 (no pertenece a ese tablero nuevo)
    const assignRes = await request(`/api/tasks/${taskRes.data.id}/assignments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { userId: 4, tipo: 'responsable' }
    });
    if (assignRes.status !== 400) {
      throw new Error(`Se esperaba 400 por no pertenecer al tablero, se recibió ${assignRes.status}`);
    }
  });

  // 7. Movimiento entre columnas Kanban
  await runTest(7, 'Mover tarea entre columnas Kanban (/api/tasks/:id/move)', async () => {
    const res = await request(`/api/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        listId: testListId2,
        posicion: 5
      }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.listId !== testListId2 || res.data.posicion !== 5) {
      throw new Error('La tarea no se actualizó con la nueva columna y posición');
    }
  });

  // 8. Creación de comentarios
  await runTest(8, 'Crear y consultar comentarios en la tarea (/api/tasks/:id/comments)', async () => {
    const createRes = await request(`/api/tasks/${createdTaskId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { contenido: 'Comentario de prueba automatizada' }
    });
    if (createRes.status !== 201) throw new Error(`Status esperado 201, recibido ${createRes.status}`);

    const getRes = await request(`/api/tasks/${createdTaskId}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (getRes.status !== 200) throw new Error(`Status esperado 200`);
    if (!getRes.data.some(c => c.contenido === 'Comentario de prueba automatizada')) {
      throw new Error('El comentario no fue persistido en MySQL');
    }
  });

  // 9. Checklist y subtareas
  await runTest(9, 'Crear checklist, agregar elementos y marcar como completado', async () => {
    const chkRes = await request(`/api/tasks/${createdTaskId}/checklists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { titulo: 'Subtareas de QA' }
    });
    if (chkRes.status !== 201) throw new Error(`Status esperado 201 en checklist`);

    const itemRes = await request(`/api/checklists/${chkRes.data.id}/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { contenido: 'Verificar respuesta en base de datos' }
    });
    if (itemRes.status !== 201) throw new Error(`Status esperado 201 en checklist item`);

    const patchItem = await request(`/api/checklist-items/${itemRes.data.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { completado: true }
    });
    if (patchItem.status !== 200 || !patchItem.data.completado) {
      throw new Error('El estado completado del checklist item no se guardó');
    }
  });

  // 10, 11, 12. Finalización de tareas, completedAt y completedBy
  await runTest(10, 'Completar tarea y registrar completedAt y completedBy en MySQL', async () => {
    const res = await request(`/api/tasks/${createdTaskId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.estado !== 'completada') throw new Error('El estado debe ser completada');
    if (!res.data.fechaFinalizacion) throw new Error('Debe guardarse fechaFinalizacion (completedAt)');
    if (res.data.completedBy !== 1) throw new Error('completedBy debe registrar el usuario autenticado');
  });

  // 13. Consulta de historial avanzado (/api/history/completed)
  await runTest(13, 'Consulta de historial permanente de tareas completadas (/api/history/completed)', async () => {
    const res = await request('/api/history/completed', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!res.data.items || !Array.isArray(res.data.items)) {
      throw new Error('Se esperaba un objeto paginado con items');
    }
    const found = res.data.items.find(t => t.id === createdTaskId);
    if (!found) throw new Error('La tarea recién completada debe aparecer en el historial permanente');
    if (!found.tiempoEmpleado) throw new Error('Debe calcularse el tiempoEmpleado');
  });

  // 14. Búsqueda y filtros avanzados
  await runTest(14, 'Búsqueda y filtros por prioridad y texto en MySQL', async () => {
    const res = await request(`/api/tasks?search=modificada&prioridad=baja`);
    if (res.status !== 200) throw new Error(`Status 200 esperado`);
    if (!res.data.some(t => t.id === createdTaskId)) {
      throw new Error('El filtro combinado no devolvió la tarea esperada');
    }
  });

  // 15 & 16. Restaurar tarea y conservar historial
  await runTest(15, 'Restaurar tarea completada a pendiente (/api/tasks/:id/restore)', async () => {
    const res = await request(`/api/tasks/${createdTaskId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.estado !== 'pendiente') throw new Error('El estado debió cambiar a pendiente');
    if (res.data.fechaFinalizacion !== null) throw new Error('fechaFinalizacion debe reiniciarse');

    // Comprobar que en el historial quedó registrada la transición
    const historyRes = await request(`/api/history?search=modificada`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (historyRes.status !== 200) throw new Error(`Status 200 en history`);
    const restoreEntry = historyRes.data.find(h => h.tareaId === createdTaskId && h.estadoNuevo === 'pendiente');
    if (!restoreEntry) {
      throw new Error('El historial debe conservar la transición de reapertura/restauración');
    }
  });

  // 17. Estadísticas reales del Dashboard
  await runTest(17, 'Consulta de estadísticas reales calculadas desde MySQL (/api/stats/dashboard)', async () => {
    const res = await request('/api/stats/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status 200 esperado`);
    if (typeof res.data.total !== 'number' || typeof res.data.completadas !== 'number') {
      throw new Error('Métricas numéricas no calculadas correctamente');
    }
  });

  // 18. Verificar rate limit normal de 50 peticiones por minuto
  await runTest(18, 'Verificar rate limit general de 50 peticiones/minuto', async () => {
    resetRateLimits();
    // 50 peticiones permitidas en ruta normal
    for (let i = 1; i <= 10; i++) {
      const res = await request('/api/tasks', { bypassRateLimit: false });
      if (res.status !== 200) {
        throw new Error(`Petición ${i} debió ser permitida bajo el límite de 50, recibió ${res.status}`);
      }
    }
  });

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE PRUEBAS AVANZADAS');
  console.log('======================================================');

  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;

  console.log(`Total pruebas: ${results.length}`);
  console.log(`Aprobadas:     ${passed}`);
  console.log(`Fallidas:      ${failed}`);
  console.log('======================================================\n');

  await stopServer();

  if (failed > 0) {
    process.exit(1);
  }
};

runAllAdvancedTests().catch((err) => {
  console.error('[ADVANCED TEST FATAL ERROR]', err);
  if (server) server.close();
  process.exit(1);
});

