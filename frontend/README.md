# 💻 Tareas_Hit — Frontend Administrativo Corporativo
## React 18 · Vite · Tablero Kanban Tipo Trello · Historial Permanente · Negro Elegante

Interfaz de usuario empresarial para la plataforma **Tareas_Hit**, desarrollada con **React 18**, **Vite** y **CSS3** bajo la dirección estética **Negro Elegante Corporativo**. Incorpora un Tablero Kanban interactivo con Drag and Drop nativo, modal enriquecido tipo Trello, visualización del Historial Permanente y métricas del Dashboard en tiempo real.

---

## 🎨 1. Estilo Visual: Negro Elegante Corporativo

- **Fondo Obsidiana:** `#07090e` / `#0b0f17`
- **Tarjetas y Superficies Grafito:** `#0c101a` / `#131b2a` / `#172236`
- **Bordes de Alta Precisión:** `#1a2436` / `#1e293b` / `#334155`
- **Tipografía:** *Plus Jakarta Sans* y *JetBrains Mono* (Google Fonts)
- **Acentos Visuales:**
  - Ámbar (`#f59e0b`): Tareas en progreso y estados intermedios.
  - Verde Esmeralda (`#10b981`): Tareas completadas y acciones exitosas.
  - Azul Corporativo (`#3b82f6`): Botones principales, enlaces y prioridad media.
  - Rojo Escarlata (`#ef4444`): Prioridad alta/urgente, eliminaciones y avisos.
  - Púrpura Real (`#8b5cf6`): Distintivo del rol Administrador e indicadores clave.
  - Cyan Neón (`#38bdf8`): Trazabilidad temporal y métricas del dashboard.
- **Iconografía:** Lucide React con stroke limpio y consistente (sin emojis no corporativos).

---

## 🏗️ 2. Arquitectura de Archivos Frontend

```
frontend/
├── index.html                 # Plantilla HTML con tipografía Plus Jakarta Sans
├── package.json               # Dependencias (React 18, React Router 6, Lucide)
├── vite.config.js             # Configuración de Vite y proxy /api a :4000
├── src/
│   ├── main.jsx               # Montaje React en root
│   ├── App.jsx                # Proveedores globales de contexto y enrutador
│   ├── styles/
│   │   └── index.css          # Sistema de diseño, variables CSS y componentes
│   ├── context/
│   │   ├── AuthContext.jsx    # Estado global de sesión, token y roles
│   │   └── ToastContext.jsx   # Notificaciones flotantes tipo Toast
│   ├── layouts/
│   │   ├── MainLayout.jsx     # Contenedor con Sidebar + Topbar + Outlet
│   │   ├── Sidebar.jsx        # Barra de navegación lateral fija con acceso a Kanban
│   │   └── Topbar.jsx         # Barra superior de sesión y estado de API
│   ├── routes/
│   │   ├── AppRoutes.jsx      # Definición de rutas públicas y privadas
│   │   └── ProtectedRoute.jsx # Guardián de autenticación y verificación de roles
│   ├── components/
│   │   ├── KanbanCard.jsx     # Tarjeta draggable con etiquetas, checklist y avatar
│   │   ├── KanbanColumn.jsx   # Columna Kanban con zona drop y creación rápida
│   │   ├── TaskDetailsModal.jsx # Modal Trello (subtareas, comentarios, etiquetas, restaurar)
│   │   ├── BoardModal.jsx     # Creación de nuevos tableros de proyecto
│   │   ├── TrelloModal.jsx    # Sincronización oficial con Trello API
│   │   ├── CreateTaskModal.jsx# Modal de creación formal de tareas
│   │   ├── EditTaskModal.jsx  # Modal de edición clásica
│   │   ├── ConfirmModal.jsx   # Diálogo de confirmación para eliminaciones
│   │   └── StatsCard.jsx      # Tarjetas KPI de estadísticas corporativas
│   ├── pages/
│   │   ├── DashboardPage.jsx  # Métricas en tiempo real calculadas desde MySQL
│   │   ├── KanbanPage.jsx     # Tablero Kanban visual con Drag and Drop nativo
│   │   ├── TasksPage.jsx      # Tabla de catálogo de tareas con filtros
│   │   ├── HistoryPage.jsx    # Historial Permanente y Bitácora de Transiciones
│   │   ├── UsersPage.jsx      # Directorio de usuarios (Admin)
│   │   ├── ActivityPage.jsx   # Bitácora de actividad / auditoría (Admin)
│   │   └── LoginPage.jsx      # Pantalla de inicio de sesión corporativa
│   └── services/
│       ├── api.js             # Cliente HTTP con inyección de Bearer Token
│       ├── authService.js     # Endpoints de autenticación
│       ├── taskService.js     # CRUD, checklists, comentarios, etiquetas, mover
│       ├── boardService.js    # Gestión de tableros y columnas
│       ├── labelService.js    # Consulta y creación de etiquetas
│       ├── statsService.js    # Estadísticas consolidadas desde MySQL
│       ├── trelloService.js   # Importación de tableros desde Trello
│       ├── userService.js     # Directorio de usuarios
│       ├── activityService.js # Consulta de bitácora
│       └── historyService.js  # Consulta de historial y tareas completadas
```

---

## 📌 3. Funcionalidades Principales

### Tablero Kanban Tipo Trello (`/kanban`)
- Selección entre múltiples tableros de proyecto.
- Columnas personalizadas con contador de tarjetas, opción para renombrar y eliminar.
- Drag and Drop nativo entre columnas persistiendo inmediatamente en la base de datos MySQL.
- Creación rápida de tarjetas desde cualquier columna.
- Filtro en vivo por texto (título/descripción), prioridad y responsable asignado.
- Botón de integración con Trello para sincronizar tableros remotos.

### Modal Tipo Trello (`TaskDetailsModal`)
- Edición fluida de título y descripción.
- Gestión interactiva de subtareas mediante checklists con porcentaje de avance dinámico.
- Sección de comentarios con avatar del autor, marca de tiempo y eliminación controlada.
- Selector de color de tarjeta (8 variantes sobrias).
- Asignación de colaboradores y gestión de etiquetas personalizadas.
- Botones de acción contextuales: *Completar Tarea*, *Restaurar Tarea*, *Archivar* y *Eliminar (Admin)*.

### Historial Permanente (`/historial`)
- **Pestaña 1: Historial Permanente (Tareas Completadas)**:
  - Registro inmutable de tareas que han alcanzado su finalización.
  - Cálculo del tiempo total transcurrido desde creación hasta finalización.
  - Filtros avanzados por rango temporal (*Hoy*, *Esta semana*, *Este mes*, *Personalizado*), prioridad y tablero.
  - Botón de *Restaurar Tarea* para reincorporarla al tablero activo manteniendo la auditoría intacta.
  - Paginación y ordenamiento ascendente/descendente.
- **Pestaña 2: Bitácora de Transiciones**:
  - Trazabilidad académica de cambios de estado y motivos de actualización.

### Dashboard de Métricas en Tiempo Real (`/`)
- Conteo global de tareas, pendientes, en desarrollo, completadas y vencidas.
- Métricas de tareas completadas hoy, esta semana y este mes.
- Tiempo promedio de resolución por tarea calculado desde MySQL.
- Gráficos visuales CSS de distribución por prioridad, carga por miembro y volumen por tablero.
- Botón de refresco instantáneo sin recargar la página.

---

## 🚀 4. Comandos de Ejecución

### Modo Desarrollo:
```bash
cd frontend
npm run dev
```
Disponible en: `http://localhost:5173`.

### Compilación para Producción:
```bash
cd frontend
npm run build
```
Genera la carpeta optimizada `dist/` en segundos sin errores ni advertencias.
