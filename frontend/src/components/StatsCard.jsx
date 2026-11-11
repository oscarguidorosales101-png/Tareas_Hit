import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color = '#3b82f6', subtitle }) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          backgroundColor: color
        }}
      />
      <div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem', letterSpacing: '-0.03em' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          border: `1px solid ${color}33`
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};

