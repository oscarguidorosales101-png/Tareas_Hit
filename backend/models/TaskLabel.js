import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class TaskLabel extends Model {}

TaskLabel.init(
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
    labelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'labels',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'TaskLabel',
    tableName: 'task_labels',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['taskId', 'labelId']
      }
    ]
  }
);

export default TaskLabel;

