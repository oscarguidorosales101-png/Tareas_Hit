import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class Label extends Model {}

Label.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '#3b82f6'
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Label',
    tableName: 'labels',
    timestamps: true
  }
);

export default Label;

