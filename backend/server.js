import app from './app.js';
import { testConnection } from './config/database.js';
import { runMigrations } from './migrations/run-migrations.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  // Comprobar y conectar a MySQL
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`✅ [MYSQL] ${dbStatus.message}`);
    try {
      await runMigrations({ seed: true });
    } catch (e) {
      console.warn('⚠️ [MIGRATIONS WARNING] No se pudieron ejecutar migraciones automáticas:', e.message);
    }
  } else {
    console.warn(`\n⚠️ [MYSQL ADVERTENCIA] ${dbStatus.message}`);
    console.warn('   La API arrancará, pero las consultas dependientes de base de datos requerirán que MySQL esté activo.\n');
  }

  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SERVIDOR TAREAS_HIT BACKEND INICIADO`);
    console.log(`📡 URL Base:        http://localhost:${PORT}`);
    console.log(`🗄️ Base de Datos:   MySQL 8.0 (Sequelize ORM)`);
    console.log(`🚦 Rate Limiting:   50 req/min (Normal) | 10 req/min (Academic Test)`);
    console.log(`📋 Módulos Activos:`);
    console.log(`   - Auth:          http://localhost:${PORT}/api/auth`);
    console.log(`   - Tareas:        http://localhost:${PORT}/api/tasks`);
    console.log(`   - Tableros:      http://localhost:${PORT}/api/boards`);
    console.log(`   - Historial:     http://localhost:${PORT}/api/history`);
    console.log(`   - Estadísticas:  http://localhost:${PORT}/api/stats/dashboard`);
    console.log(`   - Trello Opc.:   http://localhost:${PORT}/api/integrations/trello/status`);
    console.log(`======================================================\n`);
  });

  return server;
};

startServer();

export default app;
