import React from 'react';
import { Calendar, CheckSquare, MessageSquare, User, AlertCircle, Clock } from 'lucide-react';

export const KanbanCard = ({ task, onClick, onDragStart }) => {
  // Calcular progreso de checklist si existe
  let totalItems = 0;
  let completedItems = 0;
  if (task.checklists && task.checklists.length > 0) {
    task.checklists.forEach((chk) => {
      if (chk.items) {
        totalItems += chk.items.length;
        completedItems += chk.items.filter((i) => i.completado).length;
      }
    });
  }

  const commentCount = task.comments?.length || 0;

  // Comprobar si está vencida
  const isOverdue =
    task.fechaLimite &&
    task.estado !== 'completada' &&
    new Date(task.fechaLimite) < new Date(new Date().toISOString().split('T')[0]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      style={{
        backgroundColor: '#131b2a',
        border: '1px solid #1e293b',
        borderRadius: 10,
        padding: '0.875rem 1rem',
        cursor: 'grab',
        transition: 'all 0.15s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#334155';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e293b';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Barra de color temática */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: task.color || '#3b82f6'
        }}
      />

      {/* Etiquetas y Prioridad */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`badge badge-${task.prioridad}`}>
          {task.prioridad}
        </span>

        {task.labels && task.labels.length > 0 && (
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {task.labels.slice(0, 2).map((lbl) => (
              <span
                key={lbl.id || lbl.nombre}
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 4,
                  backgroundColor: `${lbl.color}22`,
                  color: lbl.color,
                  border: `1px solid ${lbl.color}44`,
                  fontWeight: 600
                }}
              >
                {lbl.nombre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Título de la tarjeta */}
      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc', lineHeight: 1.35 }}>
        {task.titulo}
      </div>

      {/* Descripción resumida */}
      {task.descripcion && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {task.descripcion}
        </div>
      )}

      {/* Checklist bar si tiene elementos */}
      {totalItems > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckSquare size={12} color="#34d399" /> Subtareas
            </span>
            <span>{completedItems}/{totalItems}</span>
          </div>
          <div style={{ height: 4, backgroundColor: '#07090e', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(completedItems / totalItems) * 100}%`,
                height: '100%',
                backgroundColor: completedItems === totalItems ? '#10b981' : '#f59e0b',
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
      )}

      {/* Pie de tarjeta: Responsable, Fecha y Contadores */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(30, 41, 59, 0.6)',
          marginTop: '0.25rem'
        }}
      >
        {/* Responsable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={`Responsable: ${task.responsable}`}>
          <img
            src={task.responsableAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={task.responsable}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1px solid #1e293b' }}
          />
          <span style={{ fontSize: '0.725rem', color: '#cbd5e1', maxWidth: 85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.responsable?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Metadatos y Fecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.725rem' }}>
          {commentCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#94a3b8' }}>
              <MessageSquare size={12} /> {commentCount}
            </span>
          )}

          {task.fechaLimite && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isOverdue ? '#ef4444' : '#94a3b8',
                fontWeight: isOverdue ? 700 : 500
              }}
              title={isOverdue ? 'Tarea vencida' : `Vence el ${task.fechaLimite}`}
            >
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              {task.fechaLimite.substring(5)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;

