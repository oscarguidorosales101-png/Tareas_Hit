import sequelize from '../config/database.js';
import User from './User.js';
import Board from './Board.js';
import BoardMember from './BoardMember.js';
import List from './List.js';
import Task from './Task.js';
import TaskAssignment from './TaskAssignment.js';
import Label from './Label.js';
import TaskLabel from './TaskLabel.js';
import Comment from './Comment.js';
import Checklist from './Checklist.js';
import ChecklistItem from './ChecklistItem.js';
import ActivityLog from './ActivityLog.js';
import TaskHistory from './TaskHistory.js';

// ==========================================
// ASOCIACIONES Y RELACIONES SEQUELIZE
// ==========================================

// 1. User <-> Board
User.hasMany(Board, { foreignKey: 'ownerId', as: 'ownedBoards' });
Board.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. Board <-> BoardMember <-> User
Board.hasMany(BoardMember, { foreignKey: 'boardId', as: 'memberships', onDelete: 'CASCADE' });
BoardMember.belongsTo(Board, { foreignKey: 'boardId' });
User.hasMany(BoardMember, { foreignKey: 'userId', as: 'boardMemberships', onDelete: 'CASCADE' });
BoardMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Board.belongsToMany(User, { through: BoardMember, as: 'members', foreignKey: 'boardId', otherKey: 'userId' });
User.belongsToMany(Board, { through: BoardMember, as: 'memberBoards', foreignKey: 'userId', otherKey: 'boardId' });

// 3. Board <-> List
Board.hasMany(List, { foreignKey: 'boardId', as: 'lists', onDelete: 'CASCADE' });
List.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

// 4. List <-> Task
List.hasMany(Task, { foreignKey: 'listId', as: 'tasks' });
Task.belongsTo(List, { foreignKey: 'listId', as: 'list' });

// 5. Board <-> Task
Board.hasMany(Task, { foreignKey: 'boardId', as: 'tasks' });
Task.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

// 6. User <-> Task (Creador y quien completó)
Task.belongsTo(User, { foreignKey: 'usuarioId', as: 'creator' });
User.hasMany(Task, { foreignKey: 'usuarioId', as: 'createdTasks' });

Task.belongsTo(User, { foreignKey: 'completedBy', as: 'completer' });
User.hasMany(Task, { foreignKey: 'completedBy', as: 'completedTasks' });

// 7. Task <-> TaskAssignment <-> User
Task.hasMany(TaskAssignment, { foreignKey: 'taskId', as: 'assignments', onDelete: 'CASCADE' });
TaskAssignment.belongsTo(Task, { foreignKey: 'taskId' });
TaskAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(TaskAssignment, { foreignKey: 'userId', as: 'taskAssignments' });

// 8. Task <-> Label (Many-to-Many)
Task.belongsToMany(Label, { through: TaskLabel, as: 'labels', foreignKey: 'taskId', otherKey: 'labelId' });
Label.belongsToMany(Task, { through: TaskLabel, as: 'tasks', foreignKey: 'labelId', otherKey: 'taskId' });

// 9. Task <-> Comment <-> User
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// 10. Task <-> Checklist <-> ChecklistItem
Task.hasMany(Checklist, { foreignKey: 'taskId', as: 'checklists', onDelete: 'CASCADE' });
Checklist.belongsTo(Task, { foreignKey: 'taskId' });
Checklist.hasMany(ChecklistItem, { foreignKey: 'checklistId', as: 'items', onDelete: 'CASCADE' });
ChecklistItem.belongsTo(Checklist, { foreignKey: 'checklistId' });

// 11. Task <-> TaskHistory
Task.hasMany(TaskHistory, { foreignKey: 'tareaId', as: 'history' });
TaskHistory.belongsTo(Task, { foreignKey: 'tareaId', constraints: false });

export {
  sequelize,
  User,
  Board,
  BoardMember,
  List,
  Task,
  TaskAssignment,
  Label,
  TaskLabel,
  Comment,
  Checklist,
  ChecklistItem,
  ActivityLog,
  TaskHistory
};

export default {
  sequelize,
  User,
  Board,
  BoardMember,
  List,
  Task,
  TaskAssignment,
  Label,
  TaskLabel,
  Comment,
  Checklist,
  ChecklistItem,
  ActivityLog,
  TaskHistory
};

