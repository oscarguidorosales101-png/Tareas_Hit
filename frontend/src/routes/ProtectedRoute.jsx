import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#07090e',
          color: '#94a3b8'
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #1e293b',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Cargando entorno seguro...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '2.5rem',
            backgroundColor: '#141c2b',
            borderRadius: 12,
            border: '1px solid #1e293b'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Acceso Restringido (HTTP 403)
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Esta sección requiere privilegios de <strong>Administrador</strong>. Tu cuenta actual posee el rol de <strong>Usuario Estándar</strong>.
          </p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

