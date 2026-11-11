import React, { useState, useEffect } from 'react';
import { X, Layout, Plus, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // Azul corporativo
  '#10b981', // Esmeralda
  '#f59e0b', // Ámbar
  '#8b5cf6', // Violeta
  '#ef4444', // Rojo
  '#06b6d4', // Cian
  '#ec4899', // Rosa
  '#64748b'  // Grafito neutro
];

export const BoardModal = ({ isOpen, onClose, onSubmit, board = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (board) {
      setFormData({
        nombre: board.nombre || '',
        descripcion: board.descripcion || '',
        color: board.color || '#3b82f6'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        color: '#3b82f6'
      });
    }
  }, [board, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${formData.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: formData.color
              }}
            >
              <Layout size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {board ? 'Editar Tablero' : 'Crear Nuevo Tablero'}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Nombre del Tablero <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Sprint Q4 — Arquitectura Cloud"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Objetivo y alcance de este tablero Kanban..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color Temático</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: c,
                      border: formData.color === c ? '2px solid #ffffff' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    {formData.color === c && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.nombre.trim()}>
              {isSubmitting ? 'Guardando...' : (board ? 'Guardar Cambios' : 'Crear Tablero')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardModal;

