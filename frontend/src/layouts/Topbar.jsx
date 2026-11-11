import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Radio, Calendar, Clock } from 'lucide-react';

export const Topbar = () => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header
      style={{
        height: 68,
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0a0e17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Estado del Sistema */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 9999,
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            fontSize: '0.775rem'
          }}
        >
          <Radio size={14} color="#10b981" />
          <span style={{ color: '#94a3b8' }}>API REST:</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Express 4.21 Conectado (4000)</span>
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem' }}>
          <Calendar size={14} />
          <span style={{ textTransform: 'capitalize' }}>{currentDate}</span>
        </div>
      </div>

      {/* Info Usuario & Último Acceso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f8fafc' }}>
            {user?.nombre}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Último acceso: {user?.ultimoAcceso || 'Hoy'}
          </div>
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: '#172236',
            border: '1px solid #28374d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}
        >
          <Shield size={18} />
        </div>
      </div>
    </header>
  );
};

