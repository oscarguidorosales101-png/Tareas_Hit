import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Users, Shield, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.message || 'Error consultando usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.rol === 'admin').length;
  const userCount = users.filter((u) => u.rol === 'user').length;

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">TABLA 2: USUARIOS DEL SISTEMA</h1>
          <p className="page-subtitle">
            Directorio administrativo de cuentas, roles y control de acceso (Protegido por <code style={{ color: '#38bdf8' }}>authorize('admin')</code>).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers}>
          <RefreshCw size={16} /> Actualizar Directorio
        </button>
      </div>

      {/* Métricas rápidas de usuarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL USUARIOS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{totalUsers}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ADMINISTRADORES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{adminCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>USUARIOS ESTÁNDAR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{userCount}</div>
          </div>
        </div>
      </div>

      {/* TABLA 2: USUARIOS */}
      <div className="table-container">
        <table className="corporate-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                  <div>Cargando directorio de usuarios...</div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
                  <div>No hay usuarios registrados</div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                    #{u.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={u.nombre}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #1e293b' }}
                      />
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {u.rol?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: u.estado === 'activo' ? '#34d399' : '#f87171'
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: u.estado === 'activo' ? '#10b981' : '#ef4444'
                        }}
                      />
                      {u.estado?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {u.ultimoAcceso || 'Nunca'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

