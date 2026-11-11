import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { TasksPage } from '../pages/TasksPage.jsx';
import { KanbanPage } from '../pages/KanbanPage.jsx';
import { UsersPage } from '../pages/UsersPage.jsx';
import { ActivityPage } from '../pages/ActivityPage.jsx';
import { HistoryPage } from '../pages/HistoryPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta Pública: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas en MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="tareas" element={<TasksPage />} />

        {/* Rutas Administrativas (Solo rol 'admin') */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="actividad"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="historial"
          element={
            <ProtectedRoute requireAdmin={true}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

