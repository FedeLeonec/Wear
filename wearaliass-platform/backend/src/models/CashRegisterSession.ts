import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CashRegisterSession extends Model {
  public id!: string;
  public tenantId!: string;
  public userId!: string;
  public openingAmount!: number;
  public closingAmount?: number;
  public expectedAmount?: number;
  public difference?: number;
  public notes?: string;
  public openedAt!: Date;
  public closedAt?: Date;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CashRegisterSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    openingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    closingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    expectedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    difference: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
  },
  {
    sequelize,
    modelName: 'cashRegisterSession',
    tableName: 'cash_register_sessions',
    timestamps: true,
  }
);

export default CashRegisterSession;