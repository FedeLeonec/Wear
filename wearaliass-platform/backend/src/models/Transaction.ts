import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Transaction extends Model {
  public id!: string;
  public tenantId!: string;
  public userId!: string;
  public type!: string;
  public amount!: number;
  public description!: string;
  public referenceId?: string; // ID de venta, compra, etc.
  public referenceType?: string; // 'SALE', 'PURCHASE', 'EXPENSE', etc.
  public date!: Date;
  public status!: string; // Estado de la transacción: COMPLETED, CANCELLED, INCOMPLETE, REJECTED, etc.
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
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
    type: {
      type: DataTypes.ENUM('INCOME', 'EXPENSE'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('COMPLETED', 'CANCELLED', 'INCOMPLETE', 'REJECTED', 'REFUNDED', 'DISPUTED', 'PAID'),
      allowNull: false,
      defaultValue: 'COMPLETED',
    },
  },
  {
    sequelize,
    modelName: 'transaction',
    tableName: 'transactions',
    timestamps: true,
  }
);

export default Transaction;