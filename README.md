# 📋 TAREAS_HIT — Sistema Full Stack de Gestión de Tareas
## Node.js · Express · React · MySQL 8.0 · Sequelize · Kanban Trello · Middlewares

Sistema Full Stack empresarial de gestión avanzada de tareas basado en la práctica académica de **Middlewares en Express** y evolucionado con persistencia relacional en **MySQL 8.0**, modelado con **Sequelize ORM**, un **Tablero Kanban interactivo estilo Trello con Drag and Drop**, **Historial Permanente de tareas completadas**, **Dashboard con métricas reales** e **Integración oficial con la API de Trello**.

---

## 🏛️ 1. Arquitectura y Estructura del Repositorio

El proyecto mantiene estricta separación modular entre frontend y backend dentro del repositorio:

```
Tareas_Hit/
├── .gitignore                # Reglas estrictas: node_modules, .env, dist, logs
├── README.md                 # Documentación global del sistema
├── backend/                  # Servidor API REST con Express, Middlewares y MySQL
│   ├── .env.example          # Plantilla de variables de entorno (DB, JWT, Trello)
│   ├── .env                  # Variables activas de entorno
│   ├── app.js                # Pipeline ordenado de middlewares y montaje de rutas
│   ├── server.js             # Punto de entrada HTTP (Puerto 4000) y arranque de DB
│   ├── package.json          # Dependencias (Express, Sequelize, MySQL2, Dotenv, Bcryptjs)
│   ├── README.md             # Documentación técnica exhaustiva del backend
│   ├── config/
│   │   └── database.js       # Configuración de conexión Sequelize a MySQL 8.0
│   ├── models/               # 13 Modelos relacionales con Sequelize
│   │   ├── index.js          # Definición de relaciones y asociaciones
│   │   ├── User.js           # Usuarios y credenciales (bcrypt)
│   │   ├── Board.js          # Tableros de trabajo
│   │   ├── BoardMember.js    # Membresías de tableros
│   │   ├── List.js           # Columnas de tableros (Por hacer, En progreso, etc.)
│   │   ├── Task.js           # Tareas, estados, prioridades, colores y posiciones
│   │   ├── TaskAssignment.js # Responsable y colaboradores
│   │   ├── Label.js          # Etiquetas personalizadas con nombres y colores
│   │   ├── TaskLabel.js      # Relación N:M Tarea-Etiqueta
│   │   ├── Comment.js        # Comentarios cronológicos
│   │   ├── Checklist.js      # Listas de control / subtareas
│   │   ├── ChecklistItem.js  # Elementos marcables de checklists
│   │   ├── ActivityLog.js    # Bitácora de actividad y auditoría HTTP
│   │   └── TaskHistory.js    # Historial de transiciones de estado
│   ├── migrations/
│   │   └── run-migrations.js # Script declarativo de migración de esquemas
│   ├── seeders/
│   │   └── run-seeders.js    # Carga inicial idempotente de datos en MySQL
│   ├── middlewares/          # Los 5 middlewares obligatorios de la práctica
│   │   ├── logger.js         # Registro [Fecha Hora] METODO URL -> STATUS (ms)
│   │   ├── auth.js           # Validación asíncrona de token Bearer y authorize(rol)
│   │   ├── validateTask.js   # Validación manual estricta sin librerías externas
│   │   ├── errorHandler.js   # Middleware centralizado con captura de errores Sequelize
│   │   └── rateLimit.js      # Rate limiter general (50 req/min) y académico (10 req/min)
│   ├── controllers/          # Controladores modulares por entidad
│   ├── services/             # Capa de servicio con Sequelize y lógica de negocio
│   ├── routes/               # Endpoints REST estructurados
│   └── tests/
│       ├── run-tests.js          # Las 20 pruebas académicas obligatorias (20/20 PASSED)
│       └── run-advanced-tests.js # Las 15 pruebas de evolución MySQL (15/15 PASSED)
└── frontend/                 # Interfaz de Usuario con React 18 y Vite
    ├── index.html            # HTML base con fuentes Plus Jakarta Sans
    ├── package.json          # React 18, React Router 6, Vite 6, Lucide React
    ├── vite.config.js        # Configuración de Vite y proxy HTTP al puerto 4000
    ├── README.md             # Documentación exhaustiva del frontend
    └── src/
        ├── App.jsx           # Árbol de componentes y contextos
        ├── main.jsx          # Montaje de React DOM
        ├── styles/index.css  # Sistema de diseño "Negro Elegante Corporativo"
        ├── components/       # Componentes visuales corporativos
        │   ├── KanbanCard.jsx       # Tarjeta de tarea interactiva draggable
        │   ├── KanbanColumn.jsx     # Columna Kanban con zona de drop
        │   ├── TaskDetailsModal.jsx # Modal Trello completo (checklists, comentarios, etiquetas)
        │   ├── BoardModal.jsx       # Modal de creación de tableros
        │   ├── TrelloModal.jsx      # Modal de sincronización con Trello API
        │   ├── CreateTaskModal.jsx  # Modal de creación formal de tareas
        │   ├── EditTaskModal.jsx    # Modal de edición clásica
        │   ├── ConfirmModal.jsx     # Diálogo de confirmación
        │   └── StatsCard.jsx        # Tarjetas KPI de estadísticas
        ├── pages/
        │   ├── DashboardPage.jsx    # Estadísticas en tiempo real desde MySQL
        │   ├── KanbanPage.jsx       # Tablero visual interactivo tipo Trello
        │   ├── TasksPage.jsx        # Gestión de tareas en tabla
        │   ├── HistoryPage.jsx      # Historial Permanente y Bitácora de Transiciones
        │   ├── UsersPage.jsx        # Gestión de usuarios (Admin)
        │   ├── ActivityPage.jsx     # Registro de actividad (Admin)
        │   └── LoginPage.jsx        # Formulario de autenticación corporativa
        ├── layouts/                 # Sidebar, Topbar y MainLayout
        ├── routes/                  # Rutas protegidas con control de roles
        ├── context/                 # AuthContext y ToastContext
        └── services/                # Clientes Axios/Fetch REST hacia el backend
```

---

## ⚡ 2. Requisitos y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v18.0.0 o superior.
- **MySQL Server**: 8.0 ejecutándose localmente en el puerto `3306`.
- Base de datos creada: `tareas_hit` (o usuario con privilegios de creación).

### Configuración de Base de Datos MySQL
En la consola de MySQL o Workbench:
```sql
CREATE DATABASE IF NOT EXISTS tareas_hit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tareas_hit_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'tareas_hit_user'@'localhost' IDENTIFIED BY '';
CREATE USER IF NOT EXISTS 'tareas_hit_user'@'127.0.0.1' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON tareas_hit.* TO 'tareas_hit_user'@'localhost';
GRANT ALL PRIVILEGES ON tareas_hit.* TO 'tareas_hit_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON tareas_hit_test.* TO 'tareas_hit_user'@'localhost';
GRANT ALL PRIVILEGES ON tareas_hit_test.* TO 'tareas_hit_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### Terminal 1: Iniciar Backend (Puerto 4000)
```bash
cd backend
npm install
npm run migrate   # Crea y sincroniza las 13 tablas en MySQL
npm run seed      # Carga usuarios, tableros, columnas y tareas de prueba
npm start         # Inicia el servidor en http://localhost:4000
```

### Terminal 2: Iniciar Frontend (Puerto 5173)
```bash
cd frontend
npm install
npm run dev       # Inicia la interfaz en http://localhost:5173
```

---

## 🧪 3. Verificación de Pruebas Automatizadas

El proyecto cuenta con dos suites completas de pruebas automatizadas que verifican el 100% de los requisitos:

### Suite 1: Las 20 Pruebas Académicas Obligatorias (20/20 PASSED)
Verifica el cumplimiento de los requerimientos originales de la práctica de Middlewares:
```bash
cd backend
npm test
```
Resultados certificados:
1. `GET /api/tasks` -> 200 (Consulta general)
2. `GET /api/tasks/999` -> 404 (Tarea inexistente)
3. `POST /api/tasks` sin token -> 401 (Rechazo por falta de autenticación)
4. `POST /api/tasks` con token y sin título -> 400 (Rechazo por `validateTask`)
5. `POST /api/tasks` con token y datos correctos -> 201 (Creación exitosa)
6. `DELETE /api/tasks/1` como user común -> 403 (Acceso denegado)
7. `DELETE /api/tasks/1` como admin -> 200 (Eliminación autorizada)
8. `GET /api/ruta-que-no-existe` -> 404 (`notFound` middleware)
9. `POST /api/auth/login` con credenciales correctas -> 200
10. `POST /api/auth/login` con credenciales erróneas -> 401
11. `GET /api/auth/me` con token válido -> 200
12. Crear tarea adicional vía `POST /api/tasks` -> 201
13. Editar tarea vía `PATCH /api/tasks/:id` -> 200
14. Completar tarea vía `PATCH /api/tasks/:id/complete` -> 200
15. Eliminar tarea vía `DELETE /api/tasks/:id` como admin -> 200
16. `GET /api/users` como admin -> 200 (Colección en MySQL)
17. `GET /api/logs` como admin -> 200 (Colección en MySQL)
18. `GET /api/history` como admin -> 200 (Colección en MySQL)
19. Protección de rutas administrativas ante rol usuario -> 403
20. Rate Limiting original (Superar 10 solicitudes/min en `/api/test-rate-limit`) -> 429

### Suite 2: Las 15 Pruebas de Evolución MySQL (15/15 PASSED)
Verifica la persistencia en base de datos, tableros Kanban, movimiento de tarjetas, comentarios, checklists, historial permanente y rate limit general:
```bash
cd backend
npm run test:advanced
```
Resultados certificados:
1. Persistencia activa con MySQL y Sequelize
2. Creación de tablero Kanban y generación automática de columnas
3. Creación de tarea asociada a tablero y columna en MySQL
4. Edición persistente de atributos en MySQL
5. Asignación de responsable con validación de membresía
6. Rechazo (400) al asignar usuarios que no pertenecen al tablero
7. Movimiento de tareas entre columnas Kanban (`/api/tasks/:id/move`)
8. Creación y consulta de comentarios asociados
9. Creación de checklists, agregado de elementos y marcado completado
10. Finalización de tareas con registro de `completedAt` y `completedBy` en MySQL
11. Consulta del Historial Permanente de tareas completadas (`/api/history/completed`)
12. Búsqueda y filtrado multicriterio en MySQL
13. Restauración de tarea completada al tablero sin borrar registro histórico
14. Estadísticas del Dashboard calculadas directamente con agregaciones SQL
15. Verificación de Rate Limiter general de 50 peticiones/minuto

---

## 🔐 4. Credenciales de Demostración

| Usuario | Correo Electrónico | Contraseña | Rol | Privilegios en el Sistema |
|---|---|---|---|---|
| **Administrador** | `admin@hit.com` | `admin123` | `admin` | Acceso irrestricto: tableros, columnas, eliminación de tareas, gestión de usuarios, bitácora de actividad y auditoría. |
| **Usuario Estándar** | `usuario@hit.com` | `user123` | `user` | Acceso a tableros Kanban, creación y edición de tareas, subtareas, comentarios, completado y restauración. Protegido contra eliminación y auditoría (HTTP 403). |

---

## 🎨 5. Características Principales de la Aplicación

### Tablero Kanban Tipo Trello
- **Múltiples Tableros**: Selector de tableros y creación rápida de nuevos tableros de proyecto.
- **Columnas Dinámicas**: Columnas por defecto (*Por hacer*, *En progreso*, *En revisión*, *Bloqueadas*, *Completadas*) con capacidad de agregar, renombrar y eliminar columnas.
- **Drag and Drop Nativo**: Arrastre fluido de tarjetas entre columnas con persistencia inmediata de columna y orden en MySQL.
- **Tarjetas Enriquecidas**: Indicadores visuales de prioridad, etiquetas de colores, avance de subtareas (ej: 2/3), conteo de comentarios, fecha límite y avatar del responsable.
- **Filtros en Tiempo Real**: Filtrado simultáneo por búsqueda de texto, prioridad y miembro asignado.

### Modal Trello de Tarea Completa
- Edición en vivo de título, descripción detallada, prioridad, color distintivo y fecha límite.
- Gestión de subtareas mediante checklists interactivos con cálculo porcentual de avance.
- Hilo de comentarios cronológicos con avatar, fecha y autor.
- Gestión de colaboradores asignados y etiquetas personalizadas con selector de color.
- Acciones rápidas: *Marcar como completada*, *Restaurar tarea*, *Archivar* y *Eliminar permanentemente* (Admin).

### Historial Permanente de Tareas Completadas
- Las tareas finalizadas **nunca se destruyen ni desaparecen del sistema**.
- Registro exacto de fecha de creación, fecha de finalización, usuario que finalizó la tarea y **tiempo total empleado** formateado cronológicamente.
- Vista con paginación, ordenamiento por tiempo empleado o fecha, y filtros por rango de fechas (*Hoy*, *Esta semana*, *Este mes*, *Personalizado*).
- Capacidad de **Restaurar Tarea**: permite reactivar la tarea devolviéndola al tablero sin borrar su registro en la auditoría histórica.

### Dashboard de Rendimiento en Tiempo Real
- Métricas calculadas en MySQL: total de tareas, pendientes, en desarrollo, completadas, vencidas y tiempo promedio de resolución.
- Desglose de tareas completadas hoy, esta semana y este mes.
- Gráficos y barras de progreso corporativas: distribución por prioridad, carga de trabajo por miembro (con avatares) y volumen por tablero.

### Integración con API Oficial de Trello
- Conexión segura mediante `TRELLO_API_KEY` y `TRELLO_TOKEN` administradas de forma privada por el backend.
- Importación directa de tableros, listas y tarjetas desde Trello hacia la base de datos MySQL local.
