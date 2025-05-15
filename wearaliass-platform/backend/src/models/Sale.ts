import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Sale extends Model {
  public id!: string;
  public tenantId!: string;
  public userId!: string; // Vendedor o cajero
  public customerId?: string;
  public saleNumber!: string;
  public date!: Date;
  public subtotal!: number;
  public tax!: number;
  public discount!: number;
  public total!: number;
  public paymentMethod!: string;
  public paymentStatus!: string;
  public notes?: string;
  public source!: string; // 'POS' o 'ECOMMERCE'
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    saleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'QR'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('POS', 'ECOMMERCE'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'sale',
    tableName: 'sales',
    timestamps: true,
  }
);

export default Sale;