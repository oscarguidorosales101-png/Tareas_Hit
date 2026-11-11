import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Checklist extends Model {}

Checklist.init(
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
    titulo: {
      type: DataTypes.STRING(120),
      defaultValue: 'Checklist de subtareas'
    }
  },
  {
    sequelize,
    modelName: 'Checklist',
    tableName: 'checklists',
    timestamps: true
  }
);

export default Checklist;

