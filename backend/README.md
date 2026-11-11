# 🚀 Tareas_Hit — Backend API REST: Middlewares Express y MySQL 8.0
## Persistencia con Sequelize ORM · Tableros Kanban · Historial Permanente · API Trello

Servicio backend de nivel empresarial desarrollado en Node.js y Express con arquitectura modular, combinando el pipeline estricto de **Middlewares en Node.js con Express** con persistencia en **MySQL 8.0** mediante **Sequelize ORM**.

---

## 📌 1. Tecnologías y Configuración

- **Entorno de Ejecución:** Node.js v18.0.0+ (ES Modules `"type": "module"`)
- **Framework Web:** Express.js 4.21.2
- **Base de Datos:** MySQL Server 8.0 (Host: `127.0.0.1:3306`)
- **ORM:** Sequelize v6 con driver `mysql2`
- **Seguridad y Criptografía:** `bcryptjs` para hashing seguro de contraseñas
- **Variables de Entorno:** `dotenv` con soporte para `.env`
- **Validación:** Manual estricta sin dependencias externas en `validateTask.js`
- **Rate Limiting:**
  - Rate Limiter general: **50 peticiones por minuto por IP** en toda la API.
  - Rate Limiter académico aislado: **10 peticiones por minuto** en `/api/test-rate-limit` para la Prueba 20 obligatoria.

---

## 🏗️ 2. Arquitectura de Archivos

```
backend/
├── .env.example               # Plantilla de variables de entorno (DB, JWT, Trello)
├── .env                       # Variables de entorno activas
├── app.js                     # Configuración de Express y orden de middlewares
├── server.js                  # Punto de entrada HTTP (Puerto 4000) e inicio de BD
├── package.json               # Dependencias y scripts de ejecución y test
├── config/
│   └── database.js            # Conexión Sequelize a MySQL 8.0
├── models/                    # 13 Modelos Relacionales con Sequelize
│   ├── index.js               # Asociaciones relacionales (1:N, N:M)
│   ├── User.js                # Usuarios y credenciales (bcrypt)
│   ├── Board.js               # Tableros Kanban
│   ├── BoardMember.js         # Membresías de tableros
│   ├── List.js                # Columnas (Por hacer, En progreso, etc.)
│   ├── Task.js                # Tareas y sus metadatos
│   ├── TaskAssignment.js      # Responsable y colaboradores
│   ├── Label.js               # Etiquetas personalizadas con colores
│   ├── TaskLabel.js           # Relación N:M Tareas-Etiquetas
│   ├── Comment.js             # Comentarios con fecha y autor
│   ├── Checklist.js           # Checklists interactivos
│   ├── ChecklistItem.js       # Elementos marcables de checklists
│   ├── ActivityLog.js         # Bitácora de actividad y auditoría HTTP
│   └── TaskHistory.js         # Transiciones de estado
├── migrations/
│   └── run-migrations.js      # Sincronización declarativa de tablas
├── seeders/
│   └── run-seeders.js         # Carga inicial idempotente en MySQL
├── middlewares/               # Middlewares académicos
│   ├── logger.js              # Registro [Fecha Hora] METODO URL -> STATUS (ms)
│   ├── auth.js                # Validación token Bearer y authorize(rol)
│   ├── validateTask.js        # Validación manual de tareas
│   ├── errorHandler.js        # Manejo de errores y excepciones Sequelize
│   └── rateLimit.js           # Limitador general (50 req/min) y prueba (10 req/min)
├── controllers/               # Controladores modulares
├── services/                  # Capa de servicio con Sequelize y lógica empresarial
├── routes/                    # Definición de rutas REST
└── tests/
    ├── run-tests.js           # Las 20 pruebas académicas originales (20/20 PASSED)
    └── run-advanced-tests.js  # Las 15 pruebas de evolución MySQL (15/15 PASSED)
```

---

## 🗄️ 3. Modelo Relacional de Base de Datos (13 Tablas en MySQL)

1. **`users`**: `id`, `nombre`, `email`, `password` (hasheada), `rol` (`admin`/`user`), `avatar`, `estado`, timestamps.
2. **`boards`**: `id`, `nombre`, `descripcion`, `color`, `creadorId`, timestamps.
3. **`board_members`**: `id`, `boardId`, `userId`, `rol` (`owner`/`member`), timestamps.
4. **`lists`**: `id`, `boardId`, `nombre`, `posicion`, `color`, timestamps.
5. **`tasks`**: `id`, `titulo`, `descripcion`, `prioridad`, `estado`, `color`, `posicion`, `fechaLimite`, `fechaFinalizacion`, `completadaEn`, `completadaPorId`, `tiempoEmpleadoSegundos`, `tiempoEmpleadoTexto`, `isArchived`, `boardId`, `listId`, `usuarioId`, timestamps.
6. **`task_assignments`**: `id`, `taskId`, `userId`, `tipo` (`responsable`/`colaborador`), timestamps.
7. **`labels`**: `id`, `nombre`, `color`, timestamps.
8. **`task_labels`**: `id`, `taskId`, `labelId`, timestamps.
9. **`comments`**: `id`, `taskId`, `usuarioId`, `contenido`, timestamps.
10. **`checklists`**: `id`, `taskId`, `titulo`, timestamps.
11. **`checklist_items`**: `id`, `checklistId`, `contenido`, `completado`, `posicion`, timestamps.
12. **`activity_logs`**: `id`, `usuarioId`, `accion`, `recurso`, `codigoHttp`, `detalles`, `ip`, timestamps.
13. **`task_histories`**: `id`, `tareaId`, `usuarioId`, `estadoAnterior`, `estadoNuevo`, `motivo`, timestamps.

---

## ⚙️ 4. Pipeline de Middlewares y Orden en `app.js`

1. **`logger`**: Primer middleware global. Emite log en consola vía `res.on('finish')`:
   `[2026-11-10 10:15:32] POST /api/tasks -> 201 (4 ms)`
2. **`express.json()`**: Parseo de cuerpos JSON.
3. **`cors()`**: Permite peticiones de origen cruzado.
4. **`rateLimit`**: General de 50 req/min por IP sobre todas las rutas.
5. **`academicRateLimit`**: 10 req/min montado en `/api/test-rate-limit` (para Prueba 20).
6. **Rutas de Autenticación** (`/api/auth`)
7. **Rutas de Tareas** (`/api/tasks`, `/api/tasks/:id/move`, `/api/tasks/:id/complete`, etc.)
8. **Rutas de Tableros y Columnas** (`/api/boards`, `/api/lists`)
9. **Rutas de Subtareas, Comentarios y Etiquetas** (`/api/checklists`, `/api/comments`, `/api/labels`)
10. **Rutas de Historial Permanente** (`/api/history/completed`, `/api/history`)
11. **Rutas de Estadísticas** (`/api/stats/dashboard`)
12. **Rutas de Integración Trello** (`/api/trello`)
13. **Rutas de Administración** (`/api/users`, `/api/logs`)
14. **`notFound`**: Responde 404 JSON a rutas inexistentes.
15. **`errorHandler`**: Middleware de 4 parámetros con captura de `SequelizeValidationError` y códigos HTTP normalizados.

---

## 📡 5. Catálogo Completo de Endpoints REST

| Método | Endpoint | Middleware / Rol | Descripción | Códigos |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticación y entrega de token | 200, 401 |
| `GET` | `/api/auth/me` | `auth` | Retorna perfil del usuario activo | 200, 401 |
| `GET` | `/api/tasks` | Opcional | Lista tareas filtradas (`search`, `estado`, `prioridad`, `boardId`) | 200 |
| `GET` | `/api/tasks/:id` | Opcional | Consulta detalle enriquecido de tarea | 200, 404 |
| `POST` | `/api/tasks` | `auth` + `validateTask` | Crea nueva tarea en MySQL | 201, 400, 401 |
| `PATCH` | `/api/tasks/:id` | `auth` + `validateTaskUpdate` | Actualiza tarea en MySQL | 200, 400, 404 |
| `PATCH` | `/api/tasks/:id/move` | `auth` | Mueve tarea entre columnas Kanban y actualiza posición | 200, 400, 404 |
| `PATCH` | `/api/tasks/:id/complete` | `auth` | Completa tarea y calcula tiempo transcurrido | 200, 404 |
| `PATCH` | `/api/tasks/:id/restore` | `auth` | Restaura tarea completada a pendiente sin borrar historial | 200, 404 |
| `PATCH` | `/api/tasks/:id/archive` | `auth` | Archiva o desarchiva tarea | 200, 404 |
| `DELETE` | `/api/tasks/:id` | `auth` + `authorize('admin')` | Elimina tarea (solo Admin) | 200, 403, 404 |
| `POST` | `/api/tasks/:id/assignments` | `auth` | Asigna responsable o colaborador validando membresía | 201, 400 |
| `POST` | `/api/tasks/:id/comments` | `auth` | Agrega comentario a tarea | 201, 400 |
| `POST` | `/api/tasks/:id/checklists` | `auth` | Crea checklist asociado a tarea | 201, 400 |
| `PATCH` | `/api/checklist-items/:id` | `auth` | Marca elemento como completado/pendiente | 200, 404 |
| `GET` | `/api/boards` | `auth` | Consulta tableros de proyectos | 200 |
| `POST` | `/api/boards` | `auth` | Crea nuevo tablero con columnas automáticas | 201, 400 |
| `POST` | `/api/boards/:id/lists` | `auth` | Añade columna a tablero | 201, 400 |
| `GET` | `/api/history/completed` | `auth` | Consulta Historial Permanente de tareas finalizadas | 200 |
| `GET` | `/api/history` | `auth` + `authorize('admin')` | Bitácora de transiciones de estado | 200, 403 |
| `GET` | `/api/stats/dashboard` | `auth` | Estadísticas consolidadas calculadas desde MySQL | 200 |
| `POST` | `/api/trello/import-board` | `auth` | Sincroniza e importa tablero desde Trello | 200, 400 |
| `GET` | `/api/users` | `auth` + `authorize('admin')` | Directorio de usuarios | 200, 403 |
| `GET` | `/api/logs` | `auth` + `authorize('admin')` | Bitácora de auditoría HTTP | 200, 403 |

---

## 🧪 6. Suites de Pruebas Automatizadas

### Ejecutar las 20 Pruebas Académicas
```bash
npm test
```
**Resultado:** 20/20 Aprobadas sin fallos.

### Ejecutar las 15 Pruebas de Evolución MySQL
```bash
npm run test:advanced
```
**Resultado:** 15/15 Aprobadas sin fallos.
