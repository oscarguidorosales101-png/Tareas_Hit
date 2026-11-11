import { sequelize } from '../models/index.js';
import { seedDatabase } from '../seeders/run-seeders.js';

export const runMigrations = async (options = { seed: true }) => {
  try {
    console.log('[MIGRATIONS] Sincronizando esquemas y tablas con MySQL...');
    await sequelize.sync({ alter: true });
    console.log('[MIGRATIONS] Tablas sincronizadas correctamente.');

    if (options.seed) {
      await seedDatabase();
    }
    return true;
  } catch (error) {
    console.error('[MIGRATIONS ERROR]', error);
    throw error;
  }
};

// Si se ejecuta directamente desde línea de comandos: `node migrations/run-migrations.js`
if (process.argv[1] && process.argv[1].endsWith('run-migrations.js')) {
  runMigrations()
    .then(() => {
      console.log('✅ Migraciones y seeders ejecutados exitosamente.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error en migraciones:', err);
      process.exit(1);
    });
}

export default runMigrations;

