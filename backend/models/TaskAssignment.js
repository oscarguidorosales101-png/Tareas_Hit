import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class TaskAssignment extends Model {}

TaskAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tipo: {
      type: DataTypes.ENUM('responsable', 'colaborador'),
      defaultValue: 'responsable',
      allowNull: false
    },
    fechaAsignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'TaskAssignment',
    tableName: 'task_assignments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['taskId', 'userId', 'tipo']
      }
    ]
  }
);

export default TaskAssignment;

