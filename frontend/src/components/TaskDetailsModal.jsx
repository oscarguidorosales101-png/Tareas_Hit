import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService.js';
import { userService } from '../services/userService.js';
import { labelService } from '../services/labelService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Trash2,
  Tag,
  CheckSquare,
  MessageSquare,
  Plus,
  RotateCcw,
  Archive,
  Save,
  AlertCircle,
  Users,
  Palette
} from 'lucide-react';

const PALETTE = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Ámbar
  '#ef4444', // Rojo
  '#8b5cf6', // Púrpura
  '#ec4899', // Rosa
  '#06b6d4', // Cyan
  '#64748b'  // Gris pizarra
];

export const TaskDetailsModal = ({ isOpen, onClose, task: initialTask, onUpdated, onDeleted }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState(initialTask);
  const [users, setUsers] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de edición de campos
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [estado, setEstado] = useState('pendiente');
  const [color, setColor] = useState('#3b82f6');
  const [fechaLimite, setFechaLimite] = useState('');
  const [responsableId, setResponsableId] = useState('');

  // Checklist nuevo
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState({});

  // Comentario nuevo
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Colaborador nuevo
  const [selectedCollabId, setSelectedCollabId] = useState('');
  // Etiqueta nueva
  const [selectedLabelId, setSelectedLabelId] = useState('');
  const [newCustomLabelName, setNewCustomLabelName] = useState('');
  const [newCustomLabelColor, setNewCustomLabelColor] = useState('#3b82f6');
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Cargar detalles completos al abrir
  const loadFullTask = async (id) => {
    setIsLoading(true);
    try {
      const fullTask = await taskService.getTaskById(id);
      setTask(fullTask);
      setTitulo(fullTask.titulo || '');
      setDescripcion(fullTask.descripcion || '');
      setPrioridad(fullTask.prioridad || 'media');
      setEstado(fullTask.estado || 'pendiente');
      setColor(fullTask.color || '#3b82f6');
      setFechaLimite(fullTask.fechaLimite || '');
      setResponsableId(fullTask.usuarioId || '');
    } catch (err) {
      console.error('Error cargando detalles completos de la tarea:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialTask?.id) {
      setTask(initialTask);
      setTitulo(initialTask.titulo || '');
      setDescripcion(initialTask.descripcion || '');
      setPrioridad(initialTask.prioridad || 'media');
      setEstado(initialTask.estado || 'pendiente');
      setColor(initialTask.color || '#3b82f6');
      setFechaLimite(initialTask.fechaLimite || '');
      setResponsableId(initialTask.usuarioId || '');

      loadFullTask(initialTask.id);

      // Cargar usuarios y etiquetas disponibles
      userService.getUsers().then(setUsers).catch(console.error);
      labelService.getLabels().then(setAvailableLabels).catch(console.error);
    }
  }, [isOpen, initialTask]);

  if (!isOpen || !task) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Guardar cambios básicos de la tarea
  const handleSaveDetails = async () => {
    try {
      const updated = await taskService.updateTask(task.id, {
        titulo,
        descripcion,
        prioridad,
        estado,
        color,
        fechaLimite: fechaLimite || null,
        usuarioId: responsableId ? parseInt(responsableId, 10) : undefined
      });
      showToast('Tarea actualizada correctamente', 'success');
      loadFullTask(task.id);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      showToast(err.message || 'Error guardando cambios', 'error');
    }
  };

  // Completar tarea
  const handleCompleteTask = async () => {
    try {
      const completed = await taskService.completeTask(task.id);
      showToast('Tarea marcada como completada e ingresada al Historial Permanente', 'success');
      loadFullTask(task.id);
      if (onUpdated) onUpdated(completed);
    } catch (err) {
      showToast(err.message || 'Error completando tarea', 'error');
    }
  };

  // Restaurar tarea
  const handleRestoreTask = async () => {
    try {
      const restored = await taskService.restoreTask(task.id);
      showToast('Tarea restaurada al tablero en estado pendiente', 'success');
      loadFullTask(task.id);
      if (onUpdated) onUpdated(restored);
    } catch (err) {
      showToast(err.message || 'Error restaurando tarea', 'error');
    }
  };

  // Archivar tarea
  const handleArchiveTask = async () => {
    try {
      await taskService.archiveTask(task.id, !task.isArchived);
      showToast(task.isArchived ? 'Tarea desarchivada' : 'Tarea archivada', 'success');
      loadFullTask(task.id);
      if (onUpdated) onUpdated();
    } catch (err) {
      showToast(err.message || 'Error archivando tarea', 'error');
    }
  };

  // Eliminar tarea (solo Admin)
  const handleDeleteTask = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente la tarea #${task.id}?`)) return;
    try {
      await taskService.deleteTask(task.id);
      showToast('Tarea eliminada correctamente', 'success');
      onClose();
      if (onDeleted) onDeleted(task.id);
    } catch (err) {
      showToast(err.message || 'Error eliminando tarea', 'error');
    }
  };

  // Checklists
  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    try {
      await taskService.createChecklist(task.id, newChecklistTitle.trim());
      setNewChecklistTitle('');
      setIsAddingChecklist(false);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error creando checklist', 'error');
    }
  };

  const handleAddChecklistItem = async (chkId) => {
    const text = newItemText[chkId];
    if (!text || !text.trim()) return;
    try {
      await taskService.addChecklistItem(chkId, text.trim());
      setNewItemText({ ...newItemText, [chkId]: '' });
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error añadiendo elemento', 'error');
    }
  };

  const handleToggleChecklistItem = async (item) => {
    try {
      await taskService.updateChecklistItem(item.id, { completado: !item.completado });
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error actualizando elemento', 'error');
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await taskService.deleteChecklistItem(itemId);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error eliminando elemento', 'error');
    }
  };

  // Comentarios
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await taskService.addComment(task.id, newComment.trim());
      setNewComment('');
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error añadiendo comentario', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await taskService.deleteComment(commentId);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error eliminando comentario', 'error');
    }
  };

  // Colaboradores
  const handleAddCollaborator = async () => {
    if (!selectedCollabId) return;
    try {
      await taskService.assignUser(task.id, { userId: parseInt(selectedCollabId, 10), tipo: 'colaborador' });
      setSelectedCollabId('');
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error asignando colaborador', 'error');
    }
  };

  const handleRemoveCollaborator = async (assignmentId) => {
    try {
      await taskService.removeAssignment(task.id, assignmentId);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error removiendo colaborador', 'error');
    }
  };

  // Etiquetas
  const handleAttachLabel = async (lblId) => {
    if (!lblId) return;
    try {
      await taskService.attachLabel(task.id, parseInt(lblId, 10));
      setSelectedLabelId('');
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error vinculando etiqueta', 'error');
    }
  };

  const handleDetachLabel = async (lblId) => {
    try {
      await taskService.detachLabel(task.id, lblId);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error removiendo etiqueta', 'error');
    }
  };

  const handleCreateAndAttachLabel = async (e) => {
    e.preventDefault();
    if (!newCustomLabelName.trim()) return;
    try {
      const created = await labelService.createLabel({
        nombre: newCustomLabelName.trim(),
        color: newCustomLabelColor
      });
      await taskService.attachLabel(task.id, created.id);
      setNewCustomLabelName('');
      setIsCreatingLabel(false);
      const allLabels = await labelService.getLabels();
      setAvailableLabels(allLabels);
      loadFullTask(task.id);
    } catch (err) {
      showToast(err.message || 'Error creando etiqueta', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 920,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderTop: `4px solid ${color}`
        }}
      >
        {/* Encabezado */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: '#1e293b',
                borderRadius: 6,
                color: '#94a3b8'
              }}
            >
              #{task.id}
            </span>
            <span className={`badge badge-${task.prioridad}`}>
              Prioridad {task.prioridad}
            </span>
            <span className={`badge badge-${task.estado?.replace(' ', '-')}`}>
              {task.estado}
            </span>
            {task.isArchived && (
              <span className="badge" style={{ backgroundColor: '#334155', color: '#94a3b8' }}>
                Archivada
              </span>
            )}
            {task.board && (
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Tablero: <strong style={{ color: '#cbd5e1' }}>{task.board.nombre}</strong>
              </span>
            )}
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal: 2 Columnas */}
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.75rem', overflowY: 'auto' }}>
          {/* COLUMNA IZQUIERDA: Contenido Principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Título editable */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TÍTULO DE LA TAREA</label>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* Etiquetas activas */}
            {task.labels && task.labels.length > 0 && (
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={13} /> ETIQUETAS ACTIVAS
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {task.labels.map((lbl) => (
                    <span
                      key={lbl.id}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 6,
                        backgroundColor: `${lbl.color}22`,
                        color: lbl.color,
                        border: `1px solid ${lbl.color}55`,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {lbl.nombre}
                      <button
                        onClick={() => handleDetachLabel(lbl.id)}
                        style={{ background: 'none', border: 'none', color: lbl.color, cursor: 'pointer', padding: 0 }}
                        title="Quitar etiqueta"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>DESCRIPCIÓN</label>
              </div>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Añade una descripción más detallada..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Checklists */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc' }}>
                  <CheckSquare size={16} color="#38bdf8" /> Checklists / Subtareas
                </div>
                {!isAddingChecklist && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => setIsAddingChecklist(true)}
                  >
                    <Plus size={13} /> Añadir Checklist
                  </button>
                )}
              </div>

              {/* Crear checklist */}
              {isAddingChecklist && (
                <form onSubmit={handleCreateChecklist} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#090e17', borderRadius: 8, border: '1px solid #1e293b' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Título del checklist (ej: Requisitos de entrega)..."
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setIsAddingChecklist(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                      Crear
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Checklists */}
              {task.checklists && task.checklists.length > 0 ? (
                task.checklists.map((chk) => {
                  const total = chk.items?.length || 0;
                  const completed = chk.items?.filter((i) => i.completado).length || 0;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={chk.id} style={{ marginBottom: '1.25rem', padding: '0.875rem', backgroundColor: '#090e17', borderRadius: 8, border: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>{chk.titulo}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{pct}%</span>
                      </div>

                      {/* Barra de progreso */}
                      <div style={{ height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s' }} />
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {chk.items && chk.items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.35rem 0.5rem',
                              borderRadius: 6,
                              backgroundColor: '#131b2a'
                            }}
                          >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, fontSize: '0.825rem' }}>
                              <input
                                type="checkbox"
                                checked={item.completado}
                                onChange={() => handleToggleChecklistItem(item)}
                                style={{ accentColor: '#10b981', cursor: 'pointer' }}
                              />
                              <span style={{ color: item.completado ? '#64748b' : '#cbd5e1', textDecoration: item.completado ? 'line-through' : 'none' }}>
                                {item.contenido}
                              </span>
                            </label>
                            <button
                              className="btn-icon"
                              style={{ padding: 2, color: '#64748b' }}
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              title="Eliminar elemento"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Añadir item a checklist */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Añadir un elemento..."
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                          value={newItemText[chk.id] || ''}
                          onChange={(e) => setNewItemText({ ...newItemText, [chk.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChecklistItem(chk.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleAddChecklistItem(chk.id)}
                        >
                          Añadir
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Sin checklists. Puedes agregar subtareas o requisitos interactivos.
                </div>
              )}
            </div>

            {/* Comentarios */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
                <MessageSquare size={16} color="#38bdf8" /> Comentarios ({task.comments?.length || 0})
              </div>

              {/* Formulario nuevo comentario */}
              <form onSubmit={handleAddComment} style={{ marginBottom: '1rem' }}>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ fontSize: '0.825rem', marginBottom: '0.4rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  disabled={isSubmittingComment || !newComment.trim()}
                >
                  {isSubmittingComment ? 'Publicando...' : 'Comentar'}
                </button>
              </form>

              {/* Lista de comentarios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        backgroundColor: '#090e17',
                        border: '1px solid #1e293b'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img
                            src={comment.autorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={comment.autor}
                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc' }}>
                            {comment.autor}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {formatDate(comment.fechaCreacion)}
                          </span>
                          {(comment.usuarioId === user?.id || isAdmin) && (
                            <button
                              className="btn-icon"
                              style={{ padding: 2, color: '#64748b' }}
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Eliminar comentario"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                        {comment.contenido}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    No hay comentarios en esta tarea todavía.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Metadatos, Asignaciones y Acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Botón Guardar Cambios Principales */}
            <button className="btn btn-primary" onClick={handleSaveDetails} style={{ width: '100%' }}>
              <Save size={16} /> Guardar Modificaciones
            </button>

            {/* Metadatos Rápidos */}
            <div style={{ padding: '1rem', borderRadius: 8, backgroundColor: '#090e17', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                CONFIGURACIÓN DE TAREA
              </div>

              {/* Estado */}
              <div>
                <label className="form-label" style={{ fontSize: '0.725rem' }}>ESTADO</label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.825rem' }}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="form-label" style={{ fontSize: '0.725rem' }}>PRIORIDAD</label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.825rem' }}
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="form-label" style={{ fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Palette size={12} /> COLOR IDENTIFICADOR
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: c,
                        border: color === c ? '2px solid #ffffff' : '1px solid transparent',
                        cursor: 'pointer',
                        transform: color === c ? 'scale(1.15)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Responsable Principal */}
              <div>
                <label className="form-label" style={{ fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={12} /> RESPONSABLE PRINCIPAL
                </label>
                <select
                  className="form-control"
                  style={{ fontSize: '0.825rem' }}
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                >
                  <option value="">Selecciona responsable...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="form-label" style={{ fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} /> FECHA LÍMITE
                </label>
                <input
                  type="date"
                  className="form-control"
                  style={{ fontSize: '0.825rem' }}
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                />
              </div>
            </div>

            {/* Colaboradores Asignados */}
            <div style={{ padding: '1rem', borderRadius: 8, backgroundColor: '#090e17', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={13} /> COLABORADORES ASIGNADOS
              </div>

              {/* Colaboradores actuales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                {task.assignments && task.assignments.length > 0 ? (
                  task.assignments.map((asg) => (
                    <div
                      key={asg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#131b2a',
                        borderRadius: 6,
                        fontSize: '0.775rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img
                          src={asg.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={asg.user?.nombre}
                          style={{ width: 18, height: 18, borderRadius: '50%' }}
                        />
                        <span style={{ color: '#f8fafc' }}>{asg.user?.nombre || `Usuario #${asg.userId}`}</span>
                      </div>
                      <button
                        className="btn-icon"
                        style={{ padding: 2, color: '#ef4444' }}
                        onClick={() => handleRemoveCollaborator(asg.id)}
                        title="Desasignar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                    Sin colaboradores adicionales asignados.
                  </span>
                )}
              </div>

              {/* Añadir colaborador */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <select
                  className="form-control"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                  value={selectedCollabId}
                  onChange={(e) => setSelectedCollabId(e.target.value)}
                >
                  <option value="">Añadir colaborador...</option>
                  {users
                    .filter((u) => u.id !== task.usuarioId && !task.assignments?.some((a) => a.userId === u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={handleAddCollaborator}
                  disabled={!selectedCollabId}
                >
                  Asignar
                </button>
              </div>
            </div>

            {/* Gestión de Etiquetas */}
            <div style={{ padding: '1rem', borderRadius: 8, backgroundColor: '#090e17', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={13} /> ASOCIAR ETIQUETAS
              </div>

              {/* Selector de etiquetas existentes */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <select
                  className="form-control"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                  value={selectedLabelId}
                  onChange={(e) => {
                    setSelectedLabelId(e.target.value);
                    if (e.target.value) handleAttachLabel(e.target.value);
                  }}
                >
                  <option value="">Selecciona etiqueta...</option>
                  {availableLabels
                    .filter((lbl) => !task.labels?.some((l) => l.id === lbl.id))
                    .map((lbl) => (
                      <option key={lbl.id} value={lbl.id}>
                        {lbl.nombre}
                      </option>
                    ))}
                </select>
              </div>

              {/* Crear nueva etiqueta si se desea */}
              {!isCreatingLabel ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.25rem', fontSize: '0.725rem' }}
                  onClick={() => setIsCreatingLabel(true)}
                >
                  + Crear Nueva Etiqueta
                </button>
              ) : (
                <form onSubmit={handleCreateAndAttachLabel} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre (ej: Urgente)..."
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                    value={newCustomLabelName}
                    onChange={(e) => setNewCustomLabelName(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newCustomLabelColor}
                      onChange={(e) => setNewCustomLabelColor(e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.25rem', fontSize: '0.725rem' }}>
                      Crear y Asignar
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem 0.4rem', fontSize: '0.725rem' }} onClick={() => setIsCreatingLabel(false)}>
                      <X size={12} />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Métricas Cronológicas e Historial */}
            <div style={{ padding: '1rem', borderRadius: 8, backgroundColor: '#090e17', border: '1px solid #1e293b', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} /> TRAZABILIDAD TEMPORAL
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Creada:</span>
                <span style={{ color: '#cbd5e1' }}>{formatDate(task.fechaCreacion)}</span>
              </div>
              {task.completadaEn && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Finalizada:</span>
                    <span style={{ fontWeight: 600 }}>{formatDate(task.completadaEn)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <span>Tiempo total:</span>
                    <span style={{ fontWeight: 700 }}>{task.tiempoEmpleadoTexto || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Acciones de Flujo (Completar, Restaurar, Archivar, Eliminar) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
              {task.estado !== 'completada' ? (
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#062b1a', border: '1px solid #10b981', color: '#34d399' }}
                  onClick={handleCompleteTask}
                >
                  <CheckCircle2 size={16} /> Marcar como Completada
                </button>
              ) : (
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6', color: '#93c5fd' }}
                  onClick={handleRestoreTask}
                >
                  <RotateCcw size={16} /> Restaurar Tarea
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={handleArchiveTask}
              >
                <Archive size={15} /> {task.isArchived ? 'Desarchivar Tarea' : 'Archivar Tarea'}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#2b0b0b', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.8rem' }}
                  onClick={handleDeleteTask}
                >
                  <Trash2 size={15} /> Eliminar Tarea (Admin)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
