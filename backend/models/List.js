import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class List extends Model {}

List.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'boards',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    posicion: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    color: {
      type: DataTypes.STRING(30),
      defaultValue: '#94a3b8'
    }
  },
  {
    sequelize,
    modelName: 'List',
    tableName: 'lists',
    timestamps: true
  }
);

export default List;

