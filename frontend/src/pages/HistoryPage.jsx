import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService.js';
import { taskService } from '../services/taskService.js';
import { boardService } from '../services/boardService.js';
import { useToast } from '../context/ToastContext.jsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.jsx';
import {
  History,
  RefreshCw,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Eye,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const HistoryPage = () => {
  const { showToast } = useToast();

  // Pestaña activa: 'completed' (Historial Permanente) o 'transitions' (Bitácora de Transiciones)
  const [activeTab, setActiveTab] = useState('completed');

  // Estado para Historial Permanente
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);

  // Filtros de Historial Permanente
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPriority, setFilterPriority] = useState('todas');
  const [filterBoard, setFilterBoard] = useState('');
  const [sortBy, setSortBy] = useState('fechaFinalizacion');
  const [order, setOrder] = useState('DESC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estado para Bitácora de Transiciones
  const [transitionLogs, setTransitionLogs] = useState([]);
  const [isLoadingTransitions, setIsLoadingTransitions] = useState(true);

  // Lista de tableros para filtro
  const [boards, setBoards] = useState([]);

  // Modal de Detalle
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Cargar tableros
  useEffect(() => {
    boardService.getBoards().then(setBoards).catch(console.error);
  }, []);

  // Cargar Historial Permanente
  const fetchCompletedHistory = async (pageToLoad = 1) => {
    setIsLoadingCompleted(true);
    try {
      const response = await historyService.getCompletedHistory({
        search: searchTerm,
        prioridad: filterPriority,
        boardId: filterBoard,
        filterDate: filterDate,
        startDate: filterDate === 'custom' ? startDate : '',
        endDate: filterDate === 'custom' ? endDate : '',
        sortBy: sortBy,
        order: order,
        page: pageToLoad,
        limit: 10
      });

      if (response && response.data) {
        setCompletedTasks(response.data);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        });
      } else if (Array.isArray(response)) {
        setCompletedTasks(response);
        setPagination({ page: 1, limit: 10, total: response.length, totalPages: 1 });
      }
    } catch (err) {
      showToast(err.message || 'Error cargando historial de tareas completadas', 'error');
    } finally {
      setIsLoadingCompleted(false);
    }
  };

  // Cargar Bitácora de Transiciones
  const fetchTransitionHistory = async () => {
    setIsLoadingTransitions(true);
    try {
      const data = await historyService.getHistory();
      setTransitionLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      showToast(err.message || 'Error consultando bitácora de transiciones', 'error');
    } finally {
      setIsLoadingTransitions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'completed') {
      fetchCompletedHistory(1);
    } else {
      fetchTransitionHistory();
    }
  }, [activeTab, filterDate, filterPriority, filterBoard, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompletedHistory(1);
  };

  // Restaurar tarea completada
  const handleRestoreTask = async (taskId) => {
    try {
      await taskService.restoreTask(taskId);
      showToast(`Tarea #${taskId} restaurada exitosamente. Se mantiene su registro histórico inmutable.`, 'success');
      fetchCompletedHistory(pagination.page);
    } catch (err) {
      showToast(err.message || 'Error restaurando tarea', 'error');
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="#38bdf8" />
            <h1 className="page-title">Historial Permanente y Auditoría</h1>
          </div>
          <p className="page-subtitle">
            Registro inmutable de tareas completadas, trazabilidad temporal y bitácora completa de transiciones de estado.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => (activeTab === 'completed' ? fetchCompletedHistory(pagination.page) : fetchTransitionHistory())}
        >
          <RefreshCw size={16} /> Refrescar Vista
        </button>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'completed' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'completed' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} color={activeTab === 'completed' ? '#10b981' : '#64748b'} />
          Historial Permanente (Tareas Completadas)
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 9999,
              backgroundColor: activeTab === 'completed' ? '#1e293b' : '#141c2b',
              color: activeTab === 'completed' ? '#38bdf8' : '#64748b'
            }}
          >
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('transitions')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'transitions' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'transitions' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ShieldCheck size={16} color={activeTab === 'transitions' ? '#8b5cf6' : '#64748b'} />
          Bitácora de Transiciones (Auditoría Académica)
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 9999,
              backgroundColor: activeTab === 'transitions' ? '#1e293b' : '#141c2b',
              color: activeTab === 'transitions' ? '#c084fc' : '#64748b'
            }}
          >
            {transitionLogs.length}
          </span>
        </button>
      </div>

      {/* CONTENIDO TAB 1: HISTORIAL PERMANENTE DE TAREAS COMPLETADAS */}
      {activeTab === 'completed' && (
        <div>
          {/* Barra de Filtros Avanzados */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#0c101a',
              border: '1px solid #1a2436',
              borderRadius: 10,
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Búsqueda */}
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por título, responsable..."
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>

              {/* Rango de Fechas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Calendar size={13} /> Rango Fecha:
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <option value="">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="custom">Personalizado...</option>
                </select>
              </div>

              {/* Prioridad */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Filter size={13} /> Prioridad:
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Tablero */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                Tablero:
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                >
                  <option value="">Todos los tableros</option>
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenamiento */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                Ordenar por:
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="fechaFinalizacion">Fecha finalización</option>
                  <option value="tiempoEmpleado">Tiempo empleado</option>
                  <option value="prioridad">Prioridad</option>
                </select>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                >
                  <option value="DESC">Descendente</option>
                  <option value="ASC">Ascendente</option>
                </select>
              </div>
            </div>

            {/* Selector de Rango Personalizado si aplica */}
            {filterDate === 'custom' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Desde:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hasta:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => fetchCompletedHistory(1)}
                >
                  Aplicar Rango
                </button>
              </div>
            )}
          </div>

          {/* Tabla de Historial Permanente */}
          <div className="table-container">
            <table className="corporate-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID Tarea</th>
                  <th>Título y Tablero</th>
                  <th>Responsable</th>
                  <th>Completado Por</th>
                  <th>Prioridad</th>
                  <th>Fecha Creación</th>
                  <th>Fecha Finalización</th>
                  <th>Tiempo Empleado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCompleted ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                      <div>Cargando historial permanente desde MySQL...</div>
                    </td>
                  </tr>
                ) : completedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
                      <div>No se encontraron tareas completadas con los filtros seleccionados</div>
                    </td>
                  </tr>
                ) : (
                  completedTasks.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                        #{item.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>
                          {item.titulo}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                          {item.board && (
                            <span style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem', borderRadius: 4, backgroundColor: '#172236', color: '#93c5fd' }}>
                              {item.board.nombre}
                            </span>
                          )}
                          {item.list && (
                            <span style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem', borderRadius: 4, backgroundColor: '#131b2a', color: '#94a3b8' }}>
                              {item.list.nombre}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <img
                            src={item.responsableAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={item.responsable}
                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.8rem' }}>
                            {item.responsable || 'Usuario'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#10b981" />
                          <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
                            {item.completadaPor || item.responsable || 'Administrador'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${item.prioridad}`}>
                          {item.prioridad}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                        {formatDate(item.fechaCreacion)}
                      </td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.775rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {formatDate(item.completadaEn || item.fechaFinalizacion)}
                      </td>
                      <td style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={13} />
                          {item.tiempoEmpleadoTexto || '0 min'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                            onClick={() => {
                              setSelectedTask(item);
                              setIsDetailOpen(true);
                            }}
                            title="Ver detalles completos"
                          >
                            <Eye size={13} /> Ver Detalle
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.725rem', backgroundColor: '#172236', color: '#93c5fd', border: '1px solid #2b3b55' }}
                            onClick={() => handleRestoreTask(item.id)}
                            title="Devolver tarea al tablero en estado pendiente"
                          >
                            <RotateCcw size={13} /> Restaurar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Mostrando {completedTasks.length} de {pagination.total} registros completados
            </span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                disabled={pagination.page <= 1}
                onClick={() => fetchCompletedHistory(pagination.page - 1)}
              >
                <ChevronLeft size={14} /> Anterior
              </button>

              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, padding: '0 0.5rem' }}>
                Página {pagination.page} de {pagination.totalPages || 1}
              </span>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCompletedHistory(pagination.page + 1)}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB 2: BITÁCORA DE TRANSICIONES (ACADÉMICA) */}
      {activeTab === 'transitions' && (
        <div>
          <div className="table-container">
            <table className="corporate-table">
              <thead>
                <tr>
                  <th>ID Historial</th>
                  <th>Tarea Asignada</th>
                  <th>Estado Anterior</th>
                  <th style={{ width: 40, textAlign: 'center' }}></th>
                  <th>Estado Nuevo</th>
                  <th>Usuario Responsable</th>
                  <th>Fecha del Cambio</th>
                  <th>Motivo / Acción</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTransitions ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto' }} />
                      <div>Cargando bitácora de transiciones...</div>
                    </td>
                  </tr>
                ) : transitionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
                      <div>No existen transiciones registradas aún</div>
                    </td>
                  </tr>
                ) : (
                  transitionLogs.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                        #{item.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {item.tarea}
                        </div>
                        {item.tareaId && (
                          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                            ID Tarea: #{item.tareaId}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${item.estadoAnterior?.replace(' ', '-')}`}>
                          {item.estadoAnterior || 'ninguno'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>
                        <ArrowRight size={14} />
                      </td>
                      <td>
                        <span className={`badge badge-${item.estadoNuevo?.replace(' ', '-')}`}>
                          {item.estadoNuevo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{item.usuario}</div>
                        {item.usuarioId && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {item.usuarioId}</div>
                        )}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} />
                          {item.fecha}
                        </div>
                      </td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>
                        {item.motivo || 'Actualización de tarea'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      <TaskDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={selectedTask}
        onUpdated={() => fetchCompletedHistory(pagination.page)}
        onDeleted={() => {
          setIsDetailOpen(false);
          fetchCompletedHistory(pagination.page);
        }}
      />
    </div>
  );
};

export default HistoryPage;
