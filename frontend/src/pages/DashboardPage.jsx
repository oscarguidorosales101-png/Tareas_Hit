import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services/statsService.js';
import { activityService } from '../services/activityService.js';
import { StatsCard } from '../components/StatsCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Users,
  Calendar,
  RefreshCw,
  Kanban,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const statsData = await statsService.getDashboardStats();
      setStats(statsData);

      if (isAdmin) {
        const logsData = await activityService.getLogs();
        setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 5) : []);
      }
    } catch (err) {
      console.error('Error cargando estadísticas del dashboard:', err);
      showToast('Error cargando estadísticas en tiempo real', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [isAdmin]);

  // Cálculos métricos seguros
  const total = stats?.total || 0;
  const pendientes = stats?.pendientes || 0;
  const enProgreso = stats?.enProgreso || 0;
  const completadas = stats?.completadas || 0;
  const vencidas = stats?.vencidas || 0;

  const percentComplete = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const percentProgreso = total > 0 ? Math.round((enProgreso / total) * 100) : 0;
  const percentPendiente = total > 0 ? Math.round((pendientes / total) * 100) : 0;

  const altaCount = stats?.porPrioridad?.alta || 0;
  const mediaCount = stats?.porPrioridad?.media || 0;
  const bajaCount = stats?.porPrioridad?.baja || 0;

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={26} color="#3b82f6" />
            <h1 className="page-title">Panel de Control Operativo</h1>
          </div>
          <p className="page-subtitle">
            Métricas de rendimiento en tiempo real procesadas directamente desde MySQL 8.0 y Sequelize.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadStats} disabled={isLoading}>
            <RefreshCw size={15} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} /> Refrescar Métricas
          </button>
          <Link to="/kanban" className="btn btn-primary">
            <Kanban size={16} /> Ir al Tablero Kanban
          </Link>
        </div>
      </div>

      {/* KPI CARDS: 6 Métricas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatsCard
          title="Total de Tareas"
          value={isLoading ? '...' : total}
          icon={CheckSquare}
          color="#3b82f6"
          subtitle="En catálogo activo"
        />
        <StatsCard
          title="Pendientes"
          value={isLoading ? '...' : pendientes}
          icon={Clock}
          color="#94a3b8"
          subtitle={`${percentPendiente}% del catálogo`}
        />
        <StatsCard
          title="En Progreso"
          value={isLoading ? '...' : enProgreso}
          icon={PlayCircle}
          color="#f59e0b"
          subtitle={`${percentProgreso}% en desarrollo`}
        />
        <StatsCard
          title="Completadas"
          value={isLoading ? '...' : completadas}
          icon={CheckCircle}
          color="#10b981"
          subtitle={`${percentComplete}% tasa de éxito`}
        />
        <StatsCard
          title="Tareas Vencidas"
          value={isLoading ? '...' : vencidas}
          icon={AlertTriangle}
          color="#ef4444"
          subtitle={vencidas > 0 ? 'Requieren atención urgente' : 'Sin retrasos'}
        />
        <StatsCard
          title="Tiempo Promedio"
          value={isLoading ? '...' : `${stats?.tiempoPromedioHoras || 0}h`}
          icon={Zap}
          color="#8b5cf6"
          subtitle="Resolución por tarea"
        />
      </div>

      {/* Franja de Logros Temporales: Tareas Completadas por Periodo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: '#0c101a',
          border: '1px solid #1a2436',
          borderRadius: 12,
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>COMPLETADAS HOY</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              {isLoading ? '...' : stats?.completadasHoy || 0}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>COMPLETADAS ESTA SEMANA</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              {isLoading ? '...' : stats?.completadasSemana || 0}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>COMPLETADAS ESTE MES</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
              {isLoading ? '...' : stats?.completadasMes || 0}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS Y DISTRIBUCIONES (4 BLOQUES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Gráfico 1: Progreso de Tareas */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Progreso y Estado de Tareas
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Tasa de finalización general: {percentComplete}%
              </p>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
              {percentComplete}%
            </span>
          </div>

          {/* Barra de progreso compuesta */}
          <div
            style={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#0c101a',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ width: `${percentComplete}%`, backgroundColor: '#10b981', transition: 'width 0.4s' }} title={`Completadas: ${percentComplete}%`} />
            <div style={{ width: `${percentProgreso}%`, backgroundColor: '#f59e0b', transition: 'width 0.4s' }} title={`En progreso: ${percentProgreso}%`} />
            <div style={{ width: `${percentPendiente}%`, backgroundColor: '#64748b', transition: 'width 0.4s' }} title={`Pendientes: ${percentPendiente}%`} />
          </div>

          {/* Desglose individual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Completadas</span>
                <span style={{ color: '#94a3b8' }}>{completadas} tareas ({percentComplete}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div style={{ width: `${percentComplete}%`, height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>En Progreso</span>
                <span style={{ color: '#94a3b8' }}>{enProgreso} tareas ({percentProgreso}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div style={{ width: `${percentProgreso}%`, height: '100%', backgroundColor: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Pendientes</span>
                <span style={{ color: '#94a3b8' }}>{pendientes} tareas ({percentPendiente}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div style={{ width: `${percentPendiente}%`, height: '100%', backgroundColor: '#64748b' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Prioridad */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Distribución por Prioridad
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Carga de trabajo clasificada según urgencia
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>Alta Prioridad</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>{altaCount}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${total > 0 ? (altaCount / total) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#ef4444'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Media Prioridad</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>{mediaCount}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${total > 0 ? (mediaCount / total) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#f59e0b'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>Baja Prioridad</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>{bajaCount}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${total > 0 ? (bajaCount / total) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6'
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              borderRadius: 8,
              backgroundColor: '#0c101a',
              border: '1px solid #1e293b',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            Prioridad auditada por el middleware <code>validateTask</code> en Express y respaldada en MySQL.
          </div>
        </div>

        {/* Gráfico 3: Carga de Trabajo por Usuario */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={18} color="#8b5cf6" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Carga de Trabajo por Usuario
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Distribución de tareas asignadas por miembro
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.porResponsable && stats.porResponsable.length > 0 ? (
              stats.porResponsable.map((u) => {
                const pct = total > 0 ? Math.round((u.totalTareas / total) * 100) : 0;
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={u.nombre}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.nombre}</span>
                        <span style={{ color: '#94a3b8' }}>{u.totalTareas} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#8b5cf6' }} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                No hay asignaciones registradas.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 4: Tareas por Tablero */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Kanban size={18} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Tareas por Tablero
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Volumen operativo por espacio de trabajo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.porTablero && stats.porTablero.length > 0 ? (
              stats.porTablero.map((b) => {
                const pct = total > 0 ? Math.round((b.totalTareas / total) * 100) : 0;
                return (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: b.color || '#3b82f6' }} />
                        {b.nombre}
                      </span>
                      <span style={{ color: '#94a3b8' }}>{b.totalTareas} tareas</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, backgroundColor: '#0c101a', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: b.color || '#3b82f6' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                Sin tableros configurados.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actividad Reciente (Exclusivo Admin) */}
      {isAdmin && recentLogs.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Últimas Operaciones del Sistema (Auditoría Middlewares)
              </h3>
            </div>
            <Link to="/actividad" style={{ color: '#38bdf8', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="corporate-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>Fecha</th>
                  <th>HTTP Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>#{log.id}</td>
                    <td style={{ fontWeight: 600 }}>{log.usuario}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#172236', color: '#93c5fd' }}>
                        {log.accion}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {log.recurso}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.fecha}</td>
                    <td>
                      <span className={`badge badge-http-${log.codigoHttp}`}>
                        {log.codigoHttp}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
