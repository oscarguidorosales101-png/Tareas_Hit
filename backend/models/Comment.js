import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Comment extends Model {}

Comment.init(
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
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true
  }
);

export default Comment;

