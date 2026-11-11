import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { assignmentController } from '../controllers/assignmentController.js';
import { commentController } from '../controllers/commentController.js';
import { checklistController } from '../controllers/checklistController.js';
import { labelController } from '../controllers/labelController.js';
import { auth, authorize, optionalAuth } from '../middlewares/auth.js';
import { validateTask, validateTaskUpdate } from '../middlewares/validateTask.js';

const router = Router();

// ==========================================
// RUTAS ORIGINALES DEL PDF (CONSERVADAS)
// ==========================================

// GET /api/tasks - Consultar todas las tareas (soporta filtros ?search=&estado=&prioridad=&boardId=)
router.get('/', optionalAuth, taskController.getTasks);

// GET /api/tasks/:id - Consultar una tarea individual
router.get('/:id', optionalAuth, taskController.getTaskById);

// POST /api/tasks - Crear una nueva tarea (auth -> validateTask -> controller)
router.post('/', auth, validateTask, taskController.createTask);

// DELETE /api/tasks/:id - Eliminar tarea (auth -> authorize('admin') -> controller)
router.delete('/:id', auth, authorize('admin'), taskController.deleteTask);

// ==========================================
// RUTAS DE GESTIÓN AVANZADA DE TAREAS
// ==========================================

// PATCH /api/tasks/:id/complete - Marcar tarea como completada (auth -> controller)
router.patch('/:id/complete', auth, taskController.completeTask);

// PATCH /api/tasks/:id/restore - Restaurar tarea completada a pendiente (auth -> controller)
router.patch('/:id/restore', auth, taskController.restoreTask);

// PATCH /api/tasks/:id/archive - Archivar o desarchivar tarea (auth -> controller)
router.patch('/:id/archive', auth, taskController.archiveTask);

// PATCH /api/tasks/:id/move - Mover tarea entre columnas Kanban y ordenar (auth -> controller)
router.patch('/:id/move', auth, taskController.moveTask);

// PATCH /api/tasks/:id - Editar campos de la tarea (auth -> validateTaskUpdate -> controller)
router.patch('/:id', auth, validateTaskUpdate, taskController.updateTask);

// ==========================================
// ASIGNACIONES, COMENTARIOS, CHECKLISTS Y ETIQUETAS
// ==========================================

// Asignaciones
router.get('/:id/assignments', auth, assignmentController.getAssignments);
router.post('/:id/assignments', auth, assignmentController.createAssignment);
router.delete('/:id/assignments/:assignmentId', auth, assignmentController.deleteAssignment);

// Comentarios
router.get('/:id/comments', auth, commentController.getComments);
router.post('/:id/comments', auth, commentController.createComment);

// Checklists
router.get('/:id/checklists', auth, checklistController.getChecklists);
router.post('/:id/checklists', auth, checklistController.createChecklist);

// Etiquetas
router.post('/:id/labels', auth, labelController.attachLabel);
router.delete('/:id/labels/:labelId', auth, labelController.detachLabel);

export default router;
