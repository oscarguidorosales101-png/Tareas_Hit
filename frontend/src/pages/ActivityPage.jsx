import React, { useState, useEffect } from 'react';
import { activityService } from '../services/activityService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Activity, RefreshCw, Search, Shield, Filter, AlertCircle } from 'lucide-react';

export const ActivityPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [httpFilter, setHttpFilter] = useState('todos');
  const { showToast } = useToast();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await activityService.getLogs();
      setLogs(data);
    } catch (err) {
      showToast(err.message || 'Error consultando bitácora de actividad', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recurso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHttp =
      httpFilter === 'todos' ||
      (httpFilter === '2xx' && log.codigoHttp >= 200 && log.codigoHttp < 300) ||
      (httpFilter === '4xx' && log.codigoHttp >= 400 && log.codigoHttp < 500) ||
      (httpFilter === '5xx' && log.codigoHttp >= 500);

    return matchesSearch && matchesHttp;
  });

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">TABLA 3: BITÁCORA DE ACTIVIDAD</h1>
          <p className="page-subtitle">
            Auditoría de peticiones HTTP, operaciones y trazabilidad de middlewares en tiempo real.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs}>
          <RefreshCw size={16} /> Refrescar Auditoría
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por usuario, acción o endpoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Estado HTTP:</span>
          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
            value={httpFilter}
            onChange={(e) => setHttpFilter(e.target.value)}
          >
            <option value="todos">Todos los Códigos</option>
            <option value="2xx">Exitosos (2xx)</option>
            <option value="4xx">Errores Cliente (4xx)</option>
            <option value="5xx">Errores Servidor (5xx)</option>
          </select>
        </div>
      </div>

      {/* TABLA 3: ACTIVIDAD */}
      <div className="table-container">
        <table className="corporate-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Acción Realizada</th>
              <th>Recurso / Endpoint</th>
              <th>Fecha y Hora</th>
              <th>Código HTTP</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                  <div>Cargando registros de actividad...</div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
                  <div>No se encontraron registros de actividad con los criterios aplicados</div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                    #{log.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{log.usuario}</div>
                    {log.usuarioId && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {log.usuarioId}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#172236',
                        color: '#93c5fd',
                        border: '1px solid #2b3b55'
                      }}
                    >
                      {log.accion}
                    </span>
                  </td>
                  <td>
                    <code
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        backgroundColor: '#0c101a',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        border: '1px solid #1e293b',
                        color: '#38bdf8'
                      }}
                    >
                      {log.recurso}
                    </code>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {log.fecha}
                  </td>
                  <td>
                    <span className={`badge badge-http-${log.codigoHttp}`}>
                      {log.codigoHttp}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem', maxWidth: 280 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.detalles}>
                      {log.detalles || '—'}
                    </div>
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

