import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CreateTaskModal } from '../components/CreateTaskModal.jsx';
import { EditTaskModal } from '../components/EditTaskModal.jsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import {
  Plus,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const TasksPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todas');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getTasks({
        search: searchTerm,
        estado: filterStatus,
        prioridad: filterPriority
      });
      setTasks(data);
    } catch (err) {
      showToast(err.message || 'Error cargando tareas', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterStatus, filterPriority, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Manejadores de Creación
  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      const created = await taskService.createTask(formData);
      showToast(`Tarea "${created.titulo}" creada exitosamente`, 'success');
      setIsCreateOpen(false);
      fetchTasks();
    } catch (err) {
      const details = err.details ? err.details.join(' ') : '';
      showToast(`${err.message} ${details}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de Edición
  const handleEdit = async (id, updates) => {
    setIsSubmitting(true);
    try {
      const updated = await taskService.updateTask(id, updates);
      showToast(`Tarea #${id} actualizada exitosamente`, 'success');
      setIsEditOpen(false);
      fetchTasks();
    } catch (err) {
      const details = err.details ? err.details.join(' ') : '';
      showToast(`${err.message} ${details}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de Completar Tarea
  const handleComplete = async (task) => {
    if (task.estado === 'completada') {
      showToast('Esta tarea ya se encuentra completada', 'info');
      return;
    }
    try {
      await taskService.completeTask(task.id);
      showToast(`Tarea #${task.id} completada correctamente`, 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Error al completar tarea', 'error');
    }
  };

  // Manejador de Eliminación
  const handleDelete = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await taskService.deleteTask(selectedTask.id);
      showToast(`Tarea #${selectedTask.id} eliminada permanentemente`, 'success');
      setIsDeleteOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Error al eliminar tarea', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const openDetailsModal = (task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const openDeleteModal = (task) => {
    if (!isAdmin) {
      showToast('Acceso denegado (HTTP 403): Solo los Administradores pueden eliminar tareas.', 'error');
      return;
    }
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  return (
    <div>
      {/* Encabezado y Acción Principal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">TABLA 1: GESTIÓN DE TAREAS</h1>
          <p className="page-subtitle">
            Administra, filtra, actualiza y da seguimiento a todas las tareas del sistema.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchTasks} title="Actualizar datos">
            <RefreshCw size={16} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Estado:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Prioridad:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* TABLA 1: TAREAS */}
      <div className="table-container">
        <table className="corporate-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha Creación</th>
              <th>Fecha Límite</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                  <div>Cargando tareas desde el backend...</div>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>No se encontraron tareas</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Prueba modificando los filtros o crea una nueva tarea con el botón superior.
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                    #{task.id}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 220 }}>
                    <div style={{ color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.titulo}
                    </div>
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={task.descripcion}
                    >
                      {task.descripcion || '—'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${task.prioridad}`}>
                      {task.prioridad}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${task.estado?.replace(' ', '-')}`}>
                      {task.estado}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                        {task.responsable || `User #${task.usuarioId}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.775rem' }}>
                    {task.fechaCreacion ? task.fechaCreacion.split('T')[0] : '—'}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.775rem' }}>
                    {task.fechaLimite || '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {/* Ver Detalles */}
                      <button
                        className="btn-icon"
                        title="Ver detalles completos"
                        onClick={() => openDetailsModal(task)}
                      >
                        <Eye size={15} color="#38bdf8" />
                      </button>

                      {/* Editar */}
                      <button
                        className="btn-icon"
                        title="Editar tarea"
                        onClick={() => openEditModal(task)}
                      >
                        <Edit2 size={15} color="#fbbf24" />
                      </button>

                      {/* Completar */}
                      <button
                        className="btn-icon"
                        title="Marcar como completada"
                        onClick={() => handleComplete(task)}
                        disabled={task.estado === 'completada'}
                        style={task.estado === 'completada' ? { opacity: 0.3 } : {}}
                      >
                        <Check size={15} color="#34d399" />
                      </button>

                      {/* Eliminar (Admin Only) */}
                      <button
                        className="btn-icon"
                        title={isAdmin ? 'Eliminar tarea' : 'Eliminar tarea (Solo Admin)'}
                        onClick={() => openDeleteModal(task)}
                        style={!isAdmin ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                      >
                        <Trash2 size={15} color="#f87171" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={selectedTask}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />

      <TaskDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        task={selectedTask}
        onUpdated={fetchTasks}
        onDeleted={() => {
          setIsDetailsOpen(false);
          fetchTasks();
        }}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar permanentemente la tarea #${selectedTask?.id} ("${selectedTask?.titulo}")? Esta acción quedará registrada en la bitácora de actividad.`}
        confirmText="Eliminar Definitivamente"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

