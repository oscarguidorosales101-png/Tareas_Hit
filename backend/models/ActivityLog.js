import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export class ActivityLog extends Model {}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'Anónimo'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    recurso: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    recursoId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metodo: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    codigoHttp: {
      type: DataTypes.INTEGER,
      defaultValue: 200
    },
    detalles: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    timestamps: true
  }
);

export default ActivityLog;

