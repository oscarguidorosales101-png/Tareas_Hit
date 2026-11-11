import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const data = await login(email, password);
      showToast(`¡Bienvenido, ${data.user.nombre}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
      showToast(err.message || 'Error al iniciar sesión', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#07090e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.08), transparent 70%)'
      }}
    >
      <div style={{ maxWidth: 460, width: '100%' }}>
        {/* Logo y Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.45)',
              marginBottom: '1rem'
            }}
          >
            <Layers size={28} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
            TAREAS<span style={{ color: '#3b82f6' }}>_HIT</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            Sistema de Gestión Corporativa con Express & Middlewares
          </p>
        </div>

        {/* Tarjeta de Login */}
        <div className="card" style={{ padding: '2rem', backdropFilter: 'blur(10px)' }}>
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="ejemplo@hit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Iniciando sesión...'
              ) : (
                <>
                  Iniciar Sesión <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Credenciales de Demostración */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #1e293b'
            }}
          >
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Credenciales de Demostración Rápida
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCredentials('admin@hit.com', 'admin123')}
                style={{
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0e1422',
                  border: '1px solid #1f2d45',
                  borderRadius: 8,
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c084fc', fontWeight: 700 }}>
                  <ShieldCheck size={14} /> ADMIN
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 2 }}>admin@hit.com</div>
              </button>

              <button
                type="button"
                onClick={() => setCredentials('usuario@hit.com', 'user123')}
                style={{
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#0e1422',
                  border: '1px solid #1f2d45',
                  borderRadius: 8,
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontWeight: 700 }}>
                  <UserCheck size={14} /> USER
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 2 }}>usuario@hit.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Nota académica */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.75rem' }}>
          Práctica Académica de Middlewares • Node.js + Express + React
        </div>
      </div>
    </div>
  );
};

