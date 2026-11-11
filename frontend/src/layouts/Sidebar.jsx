import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Activity,
  History,
  Shield,
  LogOut,
  Layers,
  Kanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/kanban', label: 'Tablero Kanban', icon: Kanban },
    { to: '/tareas', label: 'Mis Tareas', icon: CheckSquare },
    ...(isAdmin
      ? [
          { to: '/usuarios', label: 'Usuarios', icon: Users, badge: 'Admin' },
          { to: '/actividad', label: 'Actividad', icon: Activity, badge: 'Admin' },
          { to: '/historial', label: 'Historial', icon: History, badge: 'Admin' }
        ]
      : [])
  ];

  return (
    <aside
      style={{
        width: 280,
        backgroundColor: '#0a0e17',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Layers size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
            TAREAS<span style={{ color: '#3b82f6' }}>_HIT</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
            EXPRESS MIDDLEWARES
          </div>
        </div>
      </div>

      {/* Role Pill */}
      <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem' }}>
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            backgroundColor: '#141c2b',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={14} color={isAdmin ? '#c084fc' : '#60a5fa'} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Rol activo</span>
          </div>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
            {user?.rol?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.675rem', fontWeight: 700, color: '#475569', padding: '0 0.75rem 0.5rem 0.75rem', letterSpacing: '0.05em' }}>
          MENÚ PRINCIPAL
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#172236' : 'transparent',
                  border: isActive ? '1px solid #2b3b55' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#c084fc',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Middlewares Info Box */}
        <div
          style={{
            marginTop: '2rem',
            padding: '0.875rem',
            backgroundColor: '#0e1422',
            borderRadius: 8,
            border: '1px solid #1a2436',
            fontSize: '0.725rem'
          }}
        >
          <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            Pipeline Middlewares
          </div>
          <div style={{ color: '#64748b', lineHeight: 1.4 }}>
            Logger • JSON • CORS • RateLimit • Auth • ValidateTask • ErrorHandler
          </div>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#0e131f',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
          alt={user?.nombre}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #3b82f6'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#f8fafc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {user?.nombre}
          </div>
          <div
            style={{
              fontSize: '0.725rem',
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {user?.email}
          </div>
        </div>
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="btn-icon"
          style={{ color: '#ef4444' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

