import express from 'express';
import cors from 'cors';
import { logger } from './middlewares/logger.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { rateLimit, academicRateLimit } from './middlewares/rateLimit.js';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import listRoutes from './routes/listRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import checklistItemRoutes from './routes/checklistItemRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import trelloRoutes from './routes/trelloRoutes.js';

const app = express();

// ==========================================
// ORDEN OBLIGATORIO DE MIDDLEWARES
// ==========================================

// 1. Logger global (registra método, URL, código de respuesta y duración)
app.use(logger);

// 2. express.json() para parsear cuerpos de petición JSON
app.use(express.json());

// 3. CORS para permitir peticiones del cliente frontend
app.use(cors());

// Endpoint de prueba académica aislado para Rate Limiting (conserva verificación original de 10 peticiones)
app.get('/api/test-rate-limit', academicRateLimit, (req, res) => {
  res.status(200).json({ message: 'Petición dentro del límite permitido' });
});

// Middleware general de Rate Limiting (50 peticiones/minuto por IP en funcionamiento normal)
app.use(rateLimit);

// 4. Rutas de autenticación
app.use('/api/auth', authRoutes);

// 5. Rutas de tareas (CRUD, transiciones, asignaciones, comentarios, checklist)
app.use('/api/tasks', taskRoutes);

// Nuevas rutas de gestión avanzada (Tableros, Listas, Checklists, Comentarios, Etiquetas, Estadísticas)
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/checklist-items', checklistItemRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/integrations/trello', trelloRoutes);

// 6. Rutas de usuarios
app.use('/api/users', userRoutes);

// 7. Rutas de actividad (soporta /api/logs y alias /api/activity)
app.use('/api/logs', activityRoutes);
app.use('/api/activity', activityRoutes);

// 8. Rutas de historial
app.use('/api/history', historyRoutes);

// 9. Middleware notFound para rutas inexistentes (404)
app.use(notFound);

// 10. Middleware centralizado errorHandler para gestión de errores
app.use(errorHandler);

export default app;
