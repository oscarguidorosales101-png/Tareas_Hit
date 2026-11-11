import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class ChecklistItem extends Model {}

ChecklistItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    checklistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'checklists',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    contenido: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    posicion: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'ChecklistItem',
    tableName: 'checklist_items',
    timestamps: true
  }
);

export default ChecklistItem;

