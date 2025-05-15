import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Tenant extends Model {
  public id!: string;
  public name!: string;
  public domain!: string;
  public logo?: string;
  public contactEmail!: string;
  public contactPhone?: string;
  public address?: string;
  public isActive!: boolean;
  public settings!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
        is: /^[a-z0-9-]+$/,
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'tenant',
    tableName: 'tenants',
    timestamps: true,
  }
);

export default Tenant;