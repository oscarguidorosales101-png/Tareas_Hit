import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard.jsx';
import { Plus, MoreVertical, Trash2, Edit2, Check, X } from 'lucide-react';

export const KanbanColumn = ({
  list,
  tasks = [],
  onTaskClick,
  onTaskDrop,
  onAddTask,
  onRenameList,
  onDeleteList
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(list.nombre);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(parseInt(taskId, 10), list.id);
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(list.id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName.trim() !== list.nombre) {
      onRenameList(list.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: '0 0 310px',
        backgroundColor: '#0c101a',
        border: isDragOver ? '2px dashed #3b82f6' : '1px solid #1a2436',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Encabezado de Columna */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderBottom: '1px solid #1a2436',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: list.color || '#94a3b8',
              flexShrink: 0
            }}
          />

          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
              <input
                type="text"
                className="form-control"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button className="btn-icon" onClick={handleSaveName} style={{ padding: 3 }}>
                <Check size={14} color="#10b981" />
              </button>
              <button className="btn-icon" onClick={() => setIsEditingName(false)} style={{ padding: 3 }}>
                <X size={14} color="#ef4444" />
              </button>
            </div>
          ) : (
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer'
              }}
              onClick={() => setIsEditingName(true)}
              title="Haz clic para renombrar"
            >
              {list.nombre}
            </h4>
          )}

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: 9999,
              backgroundColor: '#172236',
              color: '#94a3b8'
            }}
          >
            {tasks.length}
          </span>
        </div>

        {/* Acciones de Columna */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            className="btn-icon"
            style={{ padding: 4 }}
            onClick={() => setIsAdding(!isAdding)}
            title="Añadir tarjeta a esta columna"
          >
            <Plus size={15} />
          </button>
          <button
            className="btn-icon"
            style={{ padding: 4 }}
            onClick={() => onDeleteList(list.id)}
            title="Eliminar columna"
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Contenedor de Tarjetas con Scroll */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        {/* Formulario rápido de añadir tarjeta */}
        {isAdding && (
          <form
            onSubmit={handleQuickAdd}
            style={{
              padding: '0.75rem',
              backgroundColor: '#141c2b',
              border: '1px solid #28374d',
              borderRadius: 8
            }}
          >
            <textarea
              className="form-control"
              placeholder="Introduce un título para esta tarjeta..."
              rows={2}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              style={{ fontSize: '0.825rem', marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                disabled={!newTitle.trim()}
              >
                Añadir
              </button>
            </div>
          </form>
        )}

        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onDragStart={handleDragStart}
          />
        ))}

        {tasks.length === 0 && !isAdding && (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: '#475569',
              fontSize: '0.8rem',
              border: '1px dashed #1e293b',
              borderRadius: 8
            }}
          >
            Arrastra tareas aquí o añade una nueva
          </div>
        )}
      </div>

      {/* Botón inferior rápido */}
      {!isAdding && (
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid #141c2b' }}>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              width: '100%',
              padding: '0.45rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#141c2b';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <Plus size={15} /> Añadir tarjeta
          </button>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;

