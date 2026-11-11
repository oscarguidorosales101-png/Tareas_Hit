import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'boards',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    listId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lists',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en progreso', 'completada'),
      defaultValue: 'pendiente',
      allowNull: false
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta'),
      defaultValue: 'media',
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(30),
      defaultValue: '#3b82f6'
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fechaActualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fechaLimite: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    fechaFinalizacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    completedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    posicion: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true
  }
);

export default Task;

