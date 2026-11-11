import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Board extends Model {}

Board.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(30),
      defaultValue: '#3b82f6'
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Board',
    tableName: 'boards',
    timestamps: true
  }
);

export default Board;

