/**
 * Colección de Usuarios en memoria
 * Contiene usuarios de prueba con roles 'admin' y 'user'
 */

export const users = [
  {
    id: 1,
    nombre: 'Administrador Hit',
    email: 'admin@hit.com',
    password: 'admin123',
    rol: 'admin',
    estado: 'activo',
    ultimoAcceso: '2026-11-10 14:15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    nombre: 'Carlos Desarrollador',
    email: 'usuario@hit.com',
    password: 'user123',
    rol: 'user',
    estado: 'activo',
    ultimoAcceso: '2026-11-10 13:45:00',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    nombre: 'Ana Diseñadora',
    email: 'ana@hit.com',
    password: 'user123',
    rol: 'user',
    estado: 'activo',
    ultimoAcceso: '2026-11-09 18:20:00',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    nombre: 'Lucía Tester QA',
    email: 'lucia@hit.com',
    password: 'user123',
    rol: 'user',
    estado: 'activo',
    ultimoAcceso: '2026-11-08 16:10:00',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
  }
];

export const findUserByEmail = (email) => {
  if (!email) return null;
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const findUserById = (id) => {
  const numericId = Number(id);
  return users.find(u => u.id === numericId) || null;
};

