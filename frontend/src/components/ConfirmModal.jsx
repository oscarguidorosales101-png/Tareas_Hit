import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', isDanger = false, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDanger ? '#ef4444' : '#f59e0b'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              {title}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

