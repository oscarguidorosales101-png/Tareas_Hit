import React, { useState } from 'react';
import { X, Plus, AlertCircle, Calendar } from 'lucide-react';

export const CreateTaskModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [clientErrors, setClientErrors] = useState([]);

  if (!isOpen) return null;

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
      if (trimmed.length < 3) errors.push('El título debe contener al menos 3 caracteres.');
      if (trimmed.length > 100) errors.push('El título no debe exceder los 100 caracteres.');
    }

    if (!['baja', 'media', 'alta'].includes(formData.prioridad)) {
      errors.push('La prioridad debe ser baja, media o alta.');
    }

    if (errors.length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors([]);
    onSubmit(formData);
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
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6'
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Crear Nueva Tarea</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Validado por el middleware <code style={{ color: '#38bdf8' }}>validateTask</code>
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
                placeholder="Ej. Configurar middleware de autenticación"
                value={formData.titulo}
                onChange={handleChange}
                maxLength={100}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
                <span>Mínimo 3 caracteres, máximo 100 caracteres.</span>
                <span>{formData.titulo.length}/100</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción Detallada</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows={3}
                placeholder="Detalla los requerimientos y alcance de la tarea..."
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

