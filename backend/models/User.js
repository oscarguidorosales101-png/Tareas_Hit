import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

export class User extends Model {
  async comparePassword(candidatePassword) {
    if (!candidatePassword || !this.password) return false;
    // Si la contraseña almacenada está hasheada con bcrypt
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
    // Comparación directa de respaldo (para compatibilidad de demos)
    return candidatePassword === this.password;
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo'),
      defaultValue: 'activo',
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    ultimoAcceso: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  }
);

export default User;

