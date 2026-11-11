import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env si existe
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbName = process.env.NODE_ENV === 'test' 
  ? (process.env.DB_NAME_TEST || 'tareas_hit_test')
  : (process.env.DB_NAME || 'tareas_hit');
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  dialectOptions: {
    charset: 'utf8mb4'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false
  }
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return {
      connected: true,
      message: `Conexión establecida exitosamente con MySQL [${dbName}@${dbHost}:${dbPort}]`
    };
  } catch (error) {
    return {
      connected: false,
      message: `Error al conectar con MySQL (${error.message}). Verifica que el servicio MySQL esté iniciado y las credenciales en .env sean correctas.`,
      error
    };
  }
};

export default sequelize;

