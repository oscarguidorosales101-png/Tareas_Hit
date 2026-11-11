import React, { useState, useEffect, useMemo } from 'react';
import { boardService } from '../services/boardService.js';
import { taskService } from '../services/taskService.js';
import { userService } from '../services/userService.js';
import { KanbanColumn } from '../components/KanbanColumn.jsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.jsx';
import { CreateTaskModal } from '../components/CreateTaskModal.jsx';
import { BoardModal } from '../components/BoardModal.jsx';
import { TrelloModal } from '../components/TrelloModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Kanban,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Layers,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const KanbanPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('todas');
  const [filterUser, setFilterUser] = useState('todos');

  // Modales
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [targetListIdForCreate, setTargetListIdForCreate] = useState(null);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isTrelloModalOpen, setIsTrelloModalOpen] = useState(false);

  // Nueva columna
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // 1. Cargar lista de tableros
  const loadBoards = async () => {
    try {
      const data = await boardService.getBoards();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      showToast(err.message || 'Error cargando tableros', 'error');
    }
  };

  // 2. Cargar detalles del tablero seleccionado y sus tareas
  const loadBoardData = async (boardId) => {
    if (!boardId) return;
    setIsLoading(true);
    try {
      const [boardData, boardTasks, allUsers] = await Promise.all([
        boardService.getBoardById(boardId),
        taskService.getTasks({ boardId }),
        userService.getUsers()
      ]);
      setCurrentBoard(boardData);
      setTasks(boardTasks);
      setUsers(allUsers);
    } catch (err) {
      showToast(err.message || 'Error cargando datos del tablero', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      loadBoardData(selectedBoardId);
    }
  }, [selectedBoardId]);

  // Manejo de drag and drop entre columnas
  const handleTaskDrop = async (taskId, targetListId) => {
    // Buscar la tarea y la columna de destino
    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.listId === targetListId) return;

    const targetList = currentBoard?.lists?.find((l) => l.id === targetListId);
    const isCompletedList = targetList && targetList.nombre.toLowerCase().includes('completad');

    // Actualización optimista inmediata en UI
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          listId: targetListId,
          estado: isCompletedList ? 'completada' : t.estado === 'completada' ? 'en progreso' : t.estado
        };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      // Si la lista de destino es "Completadas", completamos la tarea formalmente en MySQL
      if (isCompletedList && taskToMove.estado !== 'completada') {
        await taskService.completeTask(taskId);
        showToast(`Tarea #${taskId} completada y registrada en el Historial Permanente`, 'success');
      } else if (!isCompletedList && taskToMove.estado === 'completada') {
        await taskService.restoreTask(taskId);
        showToast(`Tarea #${taskId} restaurada y movida a ${targetList?.nombre || 'columna'}`, 'info');
      }

      // Persistir movimiento en MySQL
      await taskService.moveTask(taskId, { listId: targetListId, posicion: 0 });
      // Recargar datos para tener consistencia completa
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error moviendo tarea', 'error');
      // Revertir recargando
      loadBoardData(selectedBoardId);
    }
  };

  // Creación rápida de tarea desde columna
  const handleQuickAddTask = async (listId, title) => {
    try {
      await taskService.createTask({
        titulo: title,
        boardId: selectedBoardId,
        listId: listId,
        prioridad: 'media',
        usuarioId: user?.id
      });
      showToast('Tarjeta creada exitosamente', 'success');
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error creando tarjeta', 'error');
    }
  };

  // Crear tarea completa con modal
  const handleOpenCreateModal = (listId = null) => {
    setTargetListIdForCreate(listId || currentBoard?.lists?.[0]?.id || null);
    setIsCreateTaskOpen(true);
  };

  const handleCreateTaskSubmit = async (taskData) => {
    try {
      await taskService.createTask({
        ...taskData,
        boardId: selectedBoardId,
        listId: targetListIdForCreate || currentBoard?.lists?.[0]?.id
      });
      showToast('Tarea creada exitosamente', 'success');
      setIsCreateTaskOpen(false);
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error creando tarea', 'error');
    }
  };

  // Renombrar columna
  const handleRenameList = async (listId, newName) => {
    try {
      await boardService.updateList(listId, { nombre: newName });
      showToast('Columna renombrada', 'success');
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error renombrando columna', 'error');
    }
  };

  // Eliminar columna
  const handleDeleteList = async (listId) => {
    if (!window.confirm('¿Seguro de eliminar esta columna y todas sus tarjetas asociadas?')) return;
    try {
      await boardService.deleteList(listId);
      showToast('Columna eliminada', 'success');
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error eliminando columna', 'error');
    }
  };

  // Añadir nueva columna
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim() || !selectedBoardId) return;
    try {
      await boardService.createList(selectedBoardId, {
        nombre: newColumnName.trim(),
        posicion: (currentBoard?.lists?.length || 0) + 1
      });
      setNewColumnName('');
      setIsAddingColumn(false);
      showToast('Nueva columna agregada al tablero', 'success');
      loadBoardData(selectedBoardId);
    } catch (err) {
      showToast(err.message || 'Error creando columna', 'error');
    }
  };

  // Filtrado de tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Excluir archivadas del tablero visual
      if (t.isArchived) return false;

      // Filtro texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.titulo?.toLowerCase().includes(query);
        const matchesDesc = t.descripcion?.toLowerCase().includes(query);
        const matchesResponsible = t.responsable?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesResponsible) return false;
      }

      // Filtro prioridad
      if (filterPriority !== 'todas' && t.prioridad !== filterPriority) {
        return false;
      }

      // Filtro usuario
      if (filterUser !== 'todos' && t.usuarioId !== parseInt(filterUser, 10)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, filterPriority, filterUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* 1. Barra de Controles Superiores */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        {/* Selector de Tablero e Información */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Kanban size={22} color="#38bdf8" />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Tableros:
            </span>
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 220, fontSize: '0.9rem', fontWeight: 600, padding: '0.45rem 0.75rem' }}
            value={selectedBoardId || ''}
            onChange={(e) => setSelectedBoardId(parseInt(e.target.value, 10))}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre} ({b.color})
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setIsBoardModalOpen(true)}
          >
            <Plus size={14} /> Nuevo Tablero
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', border: '1px solid #026aa7', color: '#60a5fa' }}
            onClick={() => setIsTrelloModalOpen(true)}
            title="Integración oficial con API de Trello"
          >
            <ExternalLink size={14} /> Trello Sync
          </button>
        </div>

        {/* Acciones del Tablero Activo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => loadBoardData(selectedBoardId)}
            title="Recargar tablero"
          >
            <RefreshCw size={14} /> Refrescar
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
            onClick={() => handleOpenCreateModal()}
          >
            <Plus size={16} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* 2. Barra de Filtros y Búsqueda */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: '#0c101a',
          border: '1px solid #1a2436',
          borderRadius: 10,
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        {/* Input de Búsqueda en Vivo */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título o descripción..."
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros de Prioridad y Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <Users size={13} /> Asignado:
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="todos">Todos los miembros</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || filterPriority !== 'todas' || filterUser !== 'todos') && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchTerm('');
                setFilterPriority('todas');
                setFilterUser('todos');
              }}
            >
              Limpiar Filtros
            </button>
          )}

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'} visibles
          </div>
        </div>
      </div>

      {/* 3. Área de Tablero Kanban con Columnas y Drag and Drop */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          gap: '1.25rem',
          paddingBottom: '1rem',
          alignItems: 'flex-start'
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', gap: '0.5rem' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando tablero Kanban...
          </div>
        ) : (
          <>
            {currentBoard?.lists && currentBoard.lists.length > 0 ? (
              currentBoard.lists.map((list) => {
                const listTasks = filteredTasks.filter((t) => t.listId === list.id);
                return (
                  <KanbanColumn
                    key={list.id}
                    list={list}
                    tasks={listTasks}
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    onTaskDrop={handleTaskDrop}
                    onAddTask={handleQuickAddTask}
                    onRenameList={handleRenameList}
                    onDeleteList={handleDeleteList}
                  />
                );
              })
            ) : (
              <div style={{ padding: '3rem', color: '#64748b', textAlign: 'center', width: '100%' }}>
                Este tablero no tiene columnas aún. Agrega tu primera columna para comenzar.
              </div>
            )}

            {/* Columna para Añadir Nueva Columna */}
            <div style={{ flex: '0 0 280px' }}>
              {!isAddingColumn ? (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#0c101a',
                    border: '1px dashed #233148',
                    borderRadius: 12,
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#233148';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <Plus size={16} /> Añadir otra columna
                </button>
              ) : (
                <form
                  onSubmit={handleAddColumn}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#0c101a',
                    border: '1px solid #1e293b',
                    borderRadius: 12
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Introduce el título de la columna..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      disabled={!newColumnName.trim()}
                    >
                      Añadir columna
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setIsAddingColumn(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      {/* Modal de Detalle Completo de Tarea */}
      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadBoardData(selectedBoardId)}
        onDeleted={() => {
          setIsTaskModalOpen(false);
          loadBoardData(selectedBoardId);
        }}
      />

      {/* Modal de Creación Formal de Tarea */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />

      {/* Modal de Crear Tablero */}
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onCreated={(newBoard) => {
          loadBoards();
          setSelectedBoardId(newBoard.id);
        }}
      />

      {/* Modal de Sincronización Trello */}
      <TrelloModal
        isOpen={isTrelloModalOpen}
        onClose={() => setIsTrelloModalOpen(false)}
        targetBoardId={selectedBoardId}
        onSuccess={() => loadBoardData(selectedBoardId)}
      />
    </div>
  );
};

export default KanbanPage;

