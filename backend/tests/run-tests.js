/**
 * Suite de Pruebas Automatizadas para Tareas_Hit Backend
 * Ejecuta y verifica las 20 pruebas obligatorias especificadas en los requerimientos.
 * Compatible con persistencia en MySQL y modo de prueba aislado de 10 peticiones.
 */

import http from 'node:http';
import app from '../app.js';
import { resetRateLimits } from '../middlewares/rateLimit.js';
import { runMigrations } from '../migrations/run-migrations.js';
import { Task } from '../models/index.js';

let server;
let baseUrl;

const startServer = () => {
  return new Promise((resolve) => {
    // Usar puerto dinámico 0 para evitar conflictos
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[TEST RUNNER] Servidor de pruebas iniciado en ${baseUrl}\n`);
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[TEST RUNNER] Servidor de pruebas detenido.');
      resolve();
    });
  });
};

const results = [];

const runTest = async (number, description, testFn) => {
  try {
    await testFn();
    console.log(`✅ [PRUEBA ${number}] PASÓ: ${description}`);
    results.push({ number, description, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ [PRUEBA ${number}] FALLÓ: ${description}`);
    console.error(`   Detalle del error: ${error.message}`);
    results.push({ number, description, status: 'FAILED', error: error.message });
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

const runAllTests = async () => {
  // Asegurar que la base de datos MySQL esté migrada y con seeders listos
  try {
    await runMigrations({ seed: true });
  } catch (err) {
    console.warn('[TEST WARNING] Advertencia al sincronizar DB en pruebas:', err.message);
  }

  await startServer();

  let adminToken = '';
  let userToken = '';
  let testTaskId = null;

  console.log('======================================================');
  console.log('🧪 INICIANDO EJECUCIÓN DE LAS 20 PRUEBAS OBLIGATORIAS');
  console.log('======================================================\n');

  // Obtener tokens mediante Login para las pruebas posteriores
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

  // 1. GET /api/tasks -> 200
  await runTest(1, 'GET /api/tasks -> 200 (Consulta general de tareas)', async () => {
    const res = await request('/api/tasks');
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('La respuesta debe ser un arreglo de tareas');
  });

  // 2. GET /api/tasks/999 -> 404
  await runTest(2, 'GET /api/tasks/999 -> 404 (Consulta de tarea inexistente)', async () => {
    const res = await request('/api/tasks/999');
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido ${res.status}`);
    if (!res.data.error) throw new Error('Se esperaba mensaje de error en JSON');
  });

  // 3. POST /api/tasks sin token -> 401
  await runTest(3, 'POST /api/tasks sin token -> 401 (Rechazo por falta de autenticación)', async () => {
    const res = await request('/api/tasks', {
      method: 'POST',
      body: { titulo: 'Tarea sin token' }
    });
    if (res.status !== 401) throw new Error(`Status esperado 401, recibido ${res.status}`);
  });

  // 4. POST /api/tasks con token y sin título -> 400
  await runTest(4, 'POST /api/tasks con token y sin título -> 400 (Fallo de validación validateTask)', async () => {
    const res = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { descripcion: 'Esta tarea no tiene título' }
    });
    if (res.status !== 400) throw new Error(`Status esperado 400, recibido ${res.status}`);
    if (!res.data.details || !Array.isArray(res.data.details)) {
      throw new Error('Se esperaban detalles de validación en la respuesta');
    }
  });

  // 5. POST /api/tasks con token y datos correctos -> 201
  await runTest(5, 'POST /api/tasks con token y datos correctos -> 201 (Creación exitosa)', async () => {
    const res = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        titulo: 'Nueva tarea de prueba automatizada',
        descripcion: 'Verificando creación con validateTask y auth',
        prioridad: 'alta'
      }
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    if (!res.data.id || res.data.titulo !== 'Nueva tarea de prueba automatizada') {
      throw new Error('La tarea creada no tiene los datos esperados');
    }
    testTaskId = res.data.id;
  });

  // Garantizar que la tarea con ID 1 exista para las pruebas 6 y 7
  await Task.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      titulo: 'Diseñar arquitectura de middlewares',
      descripcion: 'Definir el pipeline secuencial de middlewares globales',
      prioridad: 'alta',
      estado: 'completada'
    }
  });

  // 6. DELETE /api/tasks/1 como user -> 403
  await runTest(6, 'DELETE /api/tasks/1 como user -> 403 (Acceso denegado por rol no autorizado)', async () => {
    const res = await request('/api/tasks/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  // 7. DELETE /api/tasks/1 como admin -> 200 o 204
  await runTest(7, 'DELETE /api/tasks/1 como admin -> 200 (Eliminación autorizada para administrador)', async () => {
    const res = await request('/api/tasks/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200 && res.status !== 204) {
      throw new Error(`Status esperado 200 o 204, recibido ${res.status}`);
    }
  });

  // 8. GET /api/ruta-que-no-existe -> 404
  await runTest(8, 'GET /api/ruta-que-no-existe -> 404 (Middleware notFound activado)', async () => {
    const res = await request('/api/ruta-que-no-existe');
    if (res.status !== 404) throw new Error(`Status esperado 404, recibido ${res.status}`);
    if (!res.data.error || !res.data.error.includes('Ruta no encontrada')) {
      throw new Error('Mensaje de ruta no encontrada no coincide');
    }
  });

  // 9. Login válido -> 200
  await runTest(9, 'POST /api/auth/login con credenciales correctas -> 200', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hit.com', password: 'admin123' }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!res.data.token || !res.data.user) throw new Error('Respuesta debe contener token y usuario');
  });

  // 10. Login inválido -> 401
  await runTest(10, 'POST /api/auth/login con credenciales erróneas -> 401', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hit.com', password: 'password_incorrecta' }
    });
    if (res.status !== 401) throw new Error(`Status esperado 401, recibido ${res.status}`);
  });

  // 11. Consulta de sesión GET /api/auth/me -> 200
  await runTest(11, 'GET /api/auth/me con token válido -> 200', async () => {
    const res = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!res.data.user || res.data.user.email !== 'admin@hit.com') {
      throw new Error('Los datos devueltos no corresponden al usuario autenticado');
    }
  });

  // 12. Crear tarea adicional desde API -> 201
  let createdTaskId2 = null;
  await runTest(12, 'Crear tarea adicional vía POST /api/tasks -> 201', async () => {
    const res = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        titulo: 'Tarea para probar edición y completado',
        descripcion: 'Creada para ser editada y completada en las siguientes pruebas',
        prioridad: 'media',
        fechaLimite: '2026-11-30'
      }
    });
    if (res.status !== 201) throw new Error(`Status esperado 201, recibido ${res.status}`);
    createdTaskId2 = res.data.id;
  });

  // 13. Editar tarea vía PATCH /api/tasks/:id -> 200
  await runTest(13, 'Editar tarea vía PATCH /api/tasks/:id -> 200', async () => {
    const targetId = createdTaskId2 || testTaskId;
    const res = await request(`/api/tasks/${targetId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        titulo: 'Título modificado exitosamente',
        prioridad: 'alta'
      }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.titulo !== 'Título modificado exitosamente' || res.data.prioridad !== 'alta') {
      throw new Error('La tarea no se actualizó con los nuevos valores');
    }
  });

  // 14. Completar tarea vía PATCH /api/tasks/:id/complete -> 200
  await runTest(14, 'Completar tarea vía PATCH /api/tasks/:id/complete -> 200', async () => {
    const targetId = createdTaskId2 || testTaskId;
    const res = await request(`/api/tasks/${targetId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (res.data.estado !== 'completada') {
      throw new Error('El estado de la tarea no cambió a "completada"');
    }
  });

  // 15. Eliminar tarea vía DELETE /api/tasks/:id como admin -> 200
  await runTest(15, 'Eliminar tarea vía DELETE /api/tasks/:id como admin -> 200', async () => {
    const targetId = createdTaskId2 || testTaskId;
    const res = await request(`/api/tasks/${targetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
  });

  // 16. Consultar usuarios GET /api/users como admin -> 200
  await runTest(16, 'GET /api/users como admin -> 200 (Colección users en MySQL)', async () => {
    const res = await request('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('Se esperaba una lista no vacía de usuarios');
    }
    // Verificar que no expone contraseñas
    if (res.data.some(u => u.password)) {
      throw new Error('Seguridad: No se deben exponer contraseñas en /api/users');
    }
  });

  // 17. Consultar actividad GET /api/logs como admin -> 200
  await runTest(17, 'GET /api/logs como admin -> 200 (Colección activity_logs en MySQL)', async () => {
    const res = await request('/api/logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Se esperaba un arreglo de registros de actividad');
  });

  // 18. Consultar historial GET /api/history como admin -> 200
  await runTest(18, 'GET /api/history como admin -> 200 (Colección task_histories en MySQL)', async () => {
    const res = await request('/api/history', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recibido ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Se esperaba un arreglo de historial de tareas');
  });

  // 19. Verificar protección de rutas (GET /api/users como user -> 403)
  await runTest(19, 'Protección de rutas: GET /api/users como usuario común -> 403', async () => {
    const res = await request('/api/users', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 403) throw new Error(`Status esperado 403, recibido ${res.status}`);
  });

  // 20. Verificar rate limiting académico original de 10 solicitudes -> 429
  await runTest(20, 'Verificar rate limiting original: Superar 10 solicitudes por minuto -> 429', async () => {
    resetRateLimits(); // Reiniciar contador para prueba limpia

    let statusReceived = null;
    let hitRateLimit = false;

    // Enviar peticiones consecutivas al endpoint de test académico sin omitir rate limit
    for (let i = 1; i <= 12; i++) {
      const res = await request('/api/test-rate-limit', {
        bypassRateLimit: false
      });
      if (res.status === 429) {
        hitRateLimit = true;
        statusReceived = res.status;
        break;
      }
    }

    if (!hitRateLimit || statusReceived !== 429) {
      throw new Error(`Se esperaba recibir HTTP 429 tras superar el límite de 10 peticiones. Último estado: ${statusReceived}`);
    }
  });

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE PRUEBAS AUTOMATIZADAS (20 OBLIGATORIAS)');
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

runAllTests().catch((err) => {
  console.error('[TEST RUNNER FATAL ERROR]', err);
  if (server) server.close();
  process.exit(1);
});
