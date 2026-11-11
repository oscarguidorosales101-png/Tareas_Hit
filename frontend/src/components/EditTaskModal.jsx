import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';

export const EditTaskModal = ({ isOpen, onClose, task, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    estado: 'pendiente',
    fechaLimite: ''
  });

  const [clientErrors, setClientErrors] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        descripcion: task.descripcion || '',
        prioridad: task.prioridad || 'media',
        estado: task.estado || 'pendiente',
        fechaLimite: task.fechaLimite ? task.fechaLimite.split('T')[0] : ''
      });
      setClientErrors([]);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = [];

    if (!formData.titulo || !formData.titulo.trim()) {
      errors.push('El título es obligatorio.');
    } else {
      const trimmed = formData.titulo.trim();
      if (trimmed.length < 3) errors.push('El título debe tener al menos 3 caracteres.');
      if (trimmed.length > 100) errors.push('El título no debe exceder los 100 caracteres.');
    }

    if (!['baja', 'media', 'alta'].includes(formData.prioridad)) {
      errors.push('La prioridad debe ser baja, media o alta.');
    }

    if (!['pendiente', 'en progreso', 'completada'].includes(formData.estado)) {
      errors.push('El estado no es válido.');
    }

    if (errors.length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors([]);
    onSubmit(task.id, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Editar Tarea #{task.id}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Actualiza datos o transiciona su estado
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {clientErrors.length > 0 && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 600, fontSize: '0.825rem' }}>
                  <AlertCircle size={16} /> Errores de Validación
                </div>
                <ul style={{ margin: '0.4rem 0 0 1.25rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                  {clientErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Título de la Tarea <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="titulo"
                className="form-control"
                value={formData.titulo}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows={3}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="estado"
                  className="form-control"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  name="prioridad"
                  className="form-control"
                  value={formData.prioridad}
                  onChange={handleChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Límite</label>
              <input
                type="date"
                name="fechaLimite"
                className="form-control"
                value={formData.fechaLimite}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-amber" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

