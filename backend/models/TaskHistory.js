import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class TaskHistory extends Model {}

TaskHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tarea: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estadoAnterior: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    estadoNuevo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    usuario: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'Sistema'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    datosCambio: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'TaskHistory',
    tableName: 'task_histories',
    timestamps: true
  }
);

export default TaskHistory;

