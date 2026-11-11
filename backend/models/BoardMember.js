import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class BoardMember extends Model {}

BoardMember.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    rol: {
      type: DataTypes.ENUM('owner', 'admin', 'member'),
      defaultValue: 'member'
    },
    fechaIncorporacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'BoardMember',
    tableName: 'board_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['boardId', 'userId']
      }
    ]
  }
);

export default BoardMember;

